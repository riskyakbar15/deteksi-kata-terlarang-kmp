from typing import List, Tuple, Dict, Any
from dataclasses import dataclass
from app.services.kmp_algorithm import KMPMatcher


@dataclass
class DetectionResult:
    """Result of a single word detection"""
    word: str
    original_word: str  # The actual word from forbidden list
    position_start: int
    position_end: int
    severity: int
    category: str
    forbidden_word_id: int


class WordDetector:
    """
    Forbidden word detector using KMP algorithm.
    
    This class provides functionality to detect forbidden words in text
    using the efficient KMP string matching algorithm, and to censor
    detected words by replacing them with asterisks.
    """
    
    def __init__(self, forbidden_words: List[Dict[str, Any]] = None, word_boundary: bool = True):
        """
        Initialize the detector with a list of forbidden words.

        Args:
            forbidden_words: List of dictionaries containing:
                - id: Word ID
                - word: The forbidden word
                - category: Word category
                - severity: Severity level (1-5)
            word_boundary: When True, only match forbidden words that stand as
                whole words (bounded by non-alphanumeric characters or the edges
                of the text). This avoids false positives such as detecting
                "las" inside "kelas".
        """
        self.forbidden_words = forbidden_words or []
        self.word_boundary = word_boundary
        self.matcher = KMPMatcher()
        self._lps_cache: Dict[str, List[int]] = {}
        self._build_lps_cache()

    def _build_lps_cache(self) -> None:
        """Precompute the LPS array for each forbidden word once."""
        self._lps_cache = {}
        for fw in self.forbidden_words:
            word = fw.get("word", "")
            if word:
                key = word.lower()
                if key not in self._lps_cache:
                    self._lps_cache[key] = self.matcher.compute_lps(key)

    def set_forbidden_words(self, forbidden_words: List[Dict[str, Any]]):
        """Update the list of forbidden words"""
        self.forbidden_words = forbidden_words
        self._build_lps_cache()

    @staticmethod
    def _is_word_char(char: str) -> bool:
        """A character is part of a word if it is alphanumeric or an underscore."""
        return char.isalnum() or char == "_"

    def _is_whole_word(self, text: str, start: int, end: int) -> bool:
        """
        Check whether the match at [start, end) is bounded by word boundaries.

        A boundary exists when the neighbouring character is not a word
        character, or when the match sits at the very start/end of the text.
        """
        before_ok = start == 0 or not self._is_word_char(text[start - 1])
        after_ok = end >= len(text) or not self._is_word_char(text[end])
        return before_ok and after_ok

    
    def detect(self, text: str) -> Tuple[str, List[DetectionResult]]:
        """
        Detect all forbidden words in the given text.
        
        Uses KMP algorithm for efficient O(n + m) pattern matching
        for each forbidden word.
        
        Args:
            text: The text to scan for forbidden words
            
        Returns:
            Tuple of (filtered_text, list of DetectionResult)
        """
        if not text or not self.forbidden_words:
            return text, []
        
        violations = []
        
        # Sort words by length (longest first) to handle overlapping words properly
        sorted_words = sorted(
            self.forbidden_words,
            key=lambda x: len(x.get("word", "")),
            reverse=True
        )
        
        # Track which positions have already been matched to avoid duplicates
        matched_positions = set()
        
        for fw in sorted_words:
            word = fw.get("word", "")
            if not word:
                continue
            
            # Use KMP algorithm to find all occurrences (reusing cached LPS)
            matches = self.matcher.search(
                text, word, case_insensitive=True,
                lps=self._lps_cache.get(word.lower())
            )
            
            for start, end in matches:
                # Skip matches that are part of a larger word (e.g. "las" in "kelas")
                if self.word_boundary and not self._is_whole_word(text, start, end):
                    continue

                # Check if this position overlaps with an already matched position
                position_range = set(range(start, end))
                if not position_range.intersection(matched_positions):
                    matched_positions.update(position_range)
                    
                    violations.append(DetectionResult(
                        word=text[start:end],  # Actual text found
                        original_word=word,     # Word from forbidden list
                        position_start=start,
                        position_end=end,
                        severity=fw.get("severity", 1),
                        category=fw.get("category", "general"),
                        forbidden_word_id=fw.get("id", 0)
                    ))
        
        # Sort violations by position
        violations.sort(key=lambda x: x.position_start)
        
        # Create filtered text
        filtered_text = self._mask_violations(text, violations) if violations else text
        
        return filtered_text, violations
    
    def _mask_violations(self, text: str, violations: List[DetectionResult], mask_char: str = "*") -> str:
        """
        Replace detected forbidden words with mask characters.
        
        Args:
            text: Original text
            violations: List of detected violations
            mask_char: Character to use for masking (default: *)
            
        Returns:
            Text with forbidden words replaced by mask characters
        """
        if not violations:
            return text
        
        # Sort by position (reverse) to replace from end to start
        # This preserves the indices for earlier replacements
        sorted_violations = sorted(violations, key=lambda x: x.position_start, reverse=True)
        
        result = text
        for v in sorted_violations:
            mask_length = v.position_end - v.position_start
            mask = mask_char * mask_length
            result = result[:v.position_start] + mask + result[v.position_end:]
        
        return result
    
    def validate_only(self, text: str) -> Tuple[bool, str, List[DetectionResult]]:
        """
        Validate text without saving to database.
        
        Args:
            text: The text to validate
            
        Returns:
            Tuple of (is_clean, filtered_text, violations)
        """
        filtered_text, violations = self.detect(text)
        is_clean = len(violations) == 0
        return is_clean, filtered_text, violations
