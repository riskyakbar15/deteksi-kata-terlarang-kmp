from typing import List, Tuple


class KMPMatcher:
    """
    Knuth-Morris-Pratt (KMP) Algorithm Implementation
    
    The KMP algorithm is an efficient string-matching algorithm that searches
    for occurrences of a "pattern" within a "text" by employing the observation
    that when a mismatch occurs, the pattern itself contains sufficient information
    to determine where the next match could begin.
    
    Time Complexity: O(n + m) where n = text length, m = pattern length
    Space Complexity: O(m) for the LPS array
    """
    
    @staticmethod
    def compute_lps(pattern: str) -> List[int]:
        """
        Compute the Longest Proper Prefix which is also Suffix (LPS) array.
        
        The LPS array is used to skip characters while matching. For each index i,
        lps[i] stores the length of the longest proper prefix of pattern[0..i]
        which is also a suffix of pattern[0..i].
        
        A proper prefix is a prefix that is not equal to the whole string.
        
        Example:
            pattern = "AABAACAABAA"
            lps = [0, 1, 0, 1, 2, 0, 1, 2, 3, 4, 5]
        
        Args:
            pattern: The pattern string to preprocess
            
        Returns:
            List of integers representing the LPS array
        """
        m = len(pattern)
        lps = [0] * m
        
        if m == 0:
            return lps
        
        length = 0  # Length of the previous longest prefix suffix
        i = 1
        
        while i < m:
            if pattern[i] == pattern[length]:
                length += 1
                lps[i] = length
                i += 1
            else:
                if length != 0:
                    # Try the previous longest prefix suffix
                    length = lps[length - 1]
                else:
                    lps[i] = 0
                    i += 1
        
        return lps
    
    @staticmethod
    def search(text: str, pattern: str, case_insensitive: bool = True, lps: List[int] = None) -> List[Tuple[int, int]]:
        """
        Search for all occurrences of pattern in text using KMP algorithm.
        
        Args:
            text: The text to search in
            pattern: The pattern to search for
            case_insensitive: Whether to perform case-insensitive matching
            lps: Optional precomputed LPS array for the (already case-normalized)
                pattern. Pass this to avoid recomputing it on every call.
            
        Returns:
            List of tuples (start_index, end_index) for each match found
        """
        if not pattern or not text:
            return []
        
        # Handle case sensitivity
        if case_insensitive:
            text_search = text.lower()
            pattern_search = pattern.lower()
        else:
            text_search = text
            pattern_search = pattern
        
        n = len(text_search)
        m = len(pattern_search)
        
        # Compute LPS array for the pattern (unless one was supplied)
        if lps is None:
            lps = KMPMatcher.compute_lps(pattern_search)
        
        matches = []
        i = 0  # Index for text
        j = 0  # Index for pattern
        
        while i < n:
            if pattern_search[j] == text_search[i]:
                i += 1
                j += 1
            
            if j == m:
                # Pattern found at index (i - j)
                start_idx = i - j
                end_idx = i
                matches.append((start_idx, end_idx))
                
                # Continue searching for more occurrences
                j = lps[j - 1]
            elif i < n and pattern_search[j] != text_search[i]:
                if j != 0:
                    # Use LPS to skip characters
                    j = lps[j - 1]
                else:
                    i += 1
        
        return matches
    
    @staticmethod
    def search_multiple(text: str, patterns: List[str], case_insensitive: bool = True) -> dict:
        """
        Search for multiple patterns in text.
        
        Args:
            text: The text to search in
            patterns: List of patterns to search for
            case_insensitive: Whether to perform case-insensitive matching
            
        Returns:
            Dictionary mapping each pattern to its list of matches
        """
        results = {}
        for pattern in patterns:
            matches = KMPMatcher.search(text, pattern, case_insensitive)
            if matches:
                results[pattern] = matches
        return results
