import re


class TrackCleaner:
    TITLE_CLEANUP_PATTERNS = (
        r" \[[^\]]+\]",
        r" - From (.*)$",
        r" - Live$",
        r" - (The )?Original$",
        r" - [^-]*Remaster(ed)?(.*)$",
        r" - [^-]*Edit(.*)$",
        r" - [^-]+Mix(.*)$",
        r" - [^-]+Remix(.*)$",
        r" - [^-]+Version(.*)$",
        r" - [^-]+Anniversary Edition(.*)$",
        r" \([^\)]*Edit(.*)\)",
        r" \([^\)]+Mix(.*)\)",
        r" \([^\)]+Remix(.*)\)",
        r" \(With (.+)\)",
        r" \([^\)]+Version(.*)\)",
        r" \(From[^\)]+\)",
        r" \(feat\. [^)]+\)",
    )

    def cleanup_title(self, title: str) -> str:
        for pattern in self.TITLE_CLEANUP_PATTERNS:
            title = re.sub(pattern, "", title, flags=re.IGNORECASE)

        return title.strip(" -")
