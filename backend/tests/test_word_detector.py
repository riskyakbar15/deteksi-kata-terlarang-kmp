from app.services.word_detector import WordDetector


def make_detector(words, **kwargs):
    forbidden = [
        {"id": i + 1, "word": w, "category": "profanity", "severity": 3}
        for i, w in enumerate(words)
    ]
    return WordDetector(forbidden, **kwargs)


class TestDetect:
    def test_no_forbidden_words(self):
        detector = WordDetector([])
        filtered, violations = detector.detect("pesan apa saja")
        assert filtered == "pesan apa saja"
        assert violations == []

    def test_empty_text(self):
        detector = make_detector(["las"])
        filtered, violations = detector.detect("")
        assert filtered == ""
        assert violations == []

    def test_detects_and_masks_word(self):
        detector = make_detector(["las"])
        filtered, violations = detector.detect("panas las listrik")
        assert filtered == "panas *** listrik"
        assert len(violations) == 1
        assert violations[0].original_word == "las"

    def test_mask_length_matches_word(self):
        detector = make_detector(["spam"])
        filtered, _ = detector.detect("ini spam sekali")
        assert filtered == "ini **** sekali"

    def test_multiple_distinct_words(self):
        detector = make_detector(["spam", "las"])
        _, violations = detector.detect("las lalu spam")
        assert len(violations) == 2


class TestWordBoundary:
    def test_ignores_substring_inside_larger_word(self):
        detector = make_detector(["las"])
        filtered, violations = detector.detect("saya masuk kelas pagi")
        assert filtered == "saya masuk kelas pagi"
        assert violations == []

    def test_matches_word_with_trailing_punctuation(self):
        detector = make_detector(["las"])
        _, violations = detector.detect("panas las!!!")
        assert len(violations) == 1

    def test_boundary_can_be_disabled(self):
        detector = make_detector(["las"], word_boundary=False)
        _, violations = detector.detect("kelas")
        assert len(violations) == 1


class TestValidateOnly:
    def test_clean_text(self):
        detector = make_detector(["las"])
        is_clean, filtered, violations = detector.validate_only("teks bersih")
        assert is_clean is True
        assert filtered == "teks bersih"
        assert violations == []

    def test_dirty_text(self):
        detector = make_detector(["las"])
        is_clean, _, violations = detector.validate_only("las listrik")
        assert is_clean is False
        assert len(violations) == 1
