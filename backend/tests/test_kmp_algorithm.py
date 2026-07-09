from app.services.kmp_algorithm import KMPMatcher


class TestComputeLPS:
    def test_empty_pattern(self):
        assert KMPMatcher.compute_lps("") == []

    def test_single_char(self):
        assert KMPMatcher.compute_lps("a") == [0]

    def test_no_repeated_prefix(self):
        assert KMPMatcher.compute_lps("abcd") == [0, 0, 0, 0]

    def test_known_pattern(self):
        # Classic textbook example.
        assert KMPMatcher.compute_lps("AABAACAABAA") == [
            0, 1, 0, 1, 2, 0, 1, 2, 3, 4, 5
        ]


class TestSearch:
    def test_empty_inputs_return_no_match(self):
        assert KMPMatcher.search("", "abc") == []
        assert KMPMatcher.search("abc", "") == []

    def test_single_match(self):
        assert KMPMatcher.search("hello world", "world") == [(6, 11)]

    def test_multiple_matches(self):
        assert KMPMatcher.search("ababab", "ab") == [(0, 2), (2, 4), (4, 6)]

    def test_overlapping_matches(self):
        # "aa" occurs at positions 0, 1, 2 in "aaaa".
        assert KMPMatcher.search("aaaa", "aa") == [(0, 2), (1, 3), (2, 4)]

    def test_case_insensitive_default(self):
        assert KMPMatcher.search("Hello World", "hello") == [(0, 5)]

    def test_case_sensitive(self):
        assert KMPMatcher.search("Hello", "hello", case_insensitive=False) == []

    def test_no_match(self):
        assert KMPMatcher.search("abcdef", "xyz") == []


class TestSearchMultiple:
    def test_returns_only_found_patterns(self):
        result = KMPMatcher.search_multiple("abcabc", ["abc", "xyz"])
        assert result == {"abc": [(0, 3), (3, 6)]}
