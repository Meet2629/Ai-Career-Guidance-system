import re


def clean_text(text):
    """
    Cleans text while preserving skill-relevant characters.
    Deliberately avoids lemmatization and stop-word removal
    because those break multi-word and symbol-containing skills
    like 'c++', 'c#', 'node js', 'scikit learn'.
    """

    # Lowercase
    text = text.lower()

    # Keep alphanumeric, spaces, +, #
    # These are needed for c++, c#
    text = re.sub(r'[^a-zA-Z0-9\s\+\#]', ' ', text)

    # Collapse multiple spaces
    text = re.sub(r'\s+', ' ', text).strip()

    return text