import string

def clean_text(text: str) -> str:
    """
    Cleans extracted resume text according to strict formatting rules:
    - Removes non-printable characters
    - Normalizes whitespace inside lines (collapses multiple spaces)
    - Trims leading and trailing whitespace from lines
    - Removes duplicate/consecutive blank lines (keeps at most one blank line for separation)
    - Trims overall leading and trailing whitespace
    """
    if not text:
        return ""

    # Remove non-printable characters (preserve printables like letters, numbers, punctuation, spaces, newlines)
    printable = set(string.printable)
    text = "".join(filter(lambda x: x in printable, text))

    # Normalize line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Split, trim, and collapse spaces within each line
    lines = text.split("\n")
    cleaned_lines = []
    for line in lines:
        # Collapse multiple spaces to a single space, and trim line
        cleaned_line = " ".join(line.split())
        cleaned_lines.append(cleaned_line)

    # Remove repeated blank lines (keep at most one consecutive blank line)
    final_lines = []
    prev_was_blank = False
    for line in cleaned_lines:
        if line == "":
            if not prev_was_blank:
                final_lines.append("")
                prev_was_blank = True
        else:
            final_lines.append(line)
            prev_was_blank = False

    # Join the lines and trim overall document leading/trailing whitespace
    return "\n".join(final_lines).strip()
