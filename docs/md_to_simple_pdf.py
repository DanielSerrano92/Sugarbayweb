from __future__ import annotations

import pathlib
import textwrap


PAGE_WIDTH = 595.28  # A4 in points
PAGE_HEIGHT = 841.89
MARGIN_LEFT = 46
MARGIN_RIGHT = 46
MARGIN_TOP = 54
MARGIN_BOTTOM = 52


def to_latin1_safe(value: str) -> str:
    return value.encode("latin-1", errors="replace").decode("latin-1")


def escape_pdf_text(value: str) -> str:
    safe = to_latin1_safe(value)
    return safe.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


class SimplePdfBuilder:
    def __init__(self) -> None:
        self.pages: list[list[str]] = []
        self.current_ops: list[str] = []
        self.y = PAGE_HEIGHT - MARGIN_TOP
        self._start_page()

    def _start_page(self) -> None:
        self.current_ops = []
        self.y = PAGE_HEIGHT - MARGIN_TOP

    def _commit_page(self) -> None:
        self.pages.append(self.current_ops)

    def _ensure_space(self, needed: float) -> None:
        if self.y - needed < MARGIN_BOTTOM:
            self._commit_page()
            self._start_page()

    def add_spacing(self, points: float) -> None:
        self._ensure_space(points)
        self.y -= points

    def add_line(
        self,
        text: str,
        *,
        size: float = 10.5,
        bold: bool = False,
        indent: float = 0.0,
        line_height: float | None = None,
    ) -> None:
        font_name = "F2" if bold else "F1"
        lh = line_height if line_height is not None else size * 1.35
        self._ensure_space(lh)
        x = MARGIN_LEFT + indent
        escaped = escape_pdf_text(text)
        self.current_ops.append(
            f"BT /{font_name} {size:.2f} Tf 1 0 0 1 {x:.2f} {self.y:.2f} Tm ({escaped}) Tj ET"
        )
        self.y -= lh

    def add_wrapped(
        self,
        text: str,
        *,
        size: float = 10.5,
        bold: bool = False,
        indent: float = 0.0,
        first_indent: float = 0.0,
    ) -> None:
        effective_width = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT - indent
        char_width = size * 0.53
        max_chars = max(24, int(effective_width / char_width))
        wrapped = textwrap.wrap(
            to_latin1_safe(text),
            width=max_chars,
            break_long_words=False,
            break_on_hyphens=False,
        )
        if not wrapped:
            self.add_line("", size=size, bold=bold, indent=indent)
            return
        for index, line in enumerate(wrapped):
            self.add_line(
                line,
                size=size,
                bold=bold,
                indent=indent + (first_indent if index == 0 else 0.0),
            )

    def finalize(self) -> bytes:
        self._commit_page()

        # Add page numbers
        total = len(self.pages)
        for page_index, ops in enumerate(self.pages, start=1):
            page_label = f"Pagina {page_index} / {total}"
            escaped = escape_pdf_text(page_label)
            ops.append(
                f"BT /F1 9.00 Tf 1 0 0 1 {PAGE_WIDTH - MARGIN_RIGHT - 94:.2f} {MARGIN_BOTTOM - 20:.2f} Tm ({escaped}) Tj ET"
            )

        objects: list[bytes] = []

        def add_object(payload: str) -> int:
            objects.append(payload.encode("latin-1", errors="replace"))
            return len(objects)

        font_regular_id = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
        font_bold_id = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

        page_ids: list[int] = []
        content_ids: list[int] = []

        for ops in self.pages:
            stream_data = "\n".join(ops).encode("latin-1", errors="replace")
            content_id = add_object(
                f"<< /Length {len(stream_data)} >>\nstream\n"
                + stream_data.decode("latin-1", errors="replace")
                + "\nendstream"
            )
            content_ids.append(content_id)

            page_id = add_object(
                "<< /Type /Page /Parent 0 0 R /MediaBox [0 0 "
                f"{PAGE_WIDTH:.2f} {PAGE_HEIGHT:.2f}] "
                f"/Contents {content_id} 0 R "
                f"/Resources << /Font << /F1 {font_regular_id} 0 R /F2 {font_bold_id} 0 R >> >> >>"
            )
            page_ids.append(page_id)

        kids = " ".join(f"{pid} 0 R" for pid in page_ids)
        pages_id = add_object(f"<< /Type /Pages /Kids [{kids}] /Count {len(page_ids)} >>")
        catalog_id = add_object(f"<< /Type /Catalog /Pages {pages_id} 0 R >>")

        # Fix Parent references now that Pages object id is known
        pages_parent_ref = f"/Parent {pages_id} 0 R"
        for page_id in page_ids:
            payload = objects[page_id - 1].decode("latin-1")
            payload = payload.replace("/Parent 0 0 R", pages_parent_ref)
            objects[page_id - 1] = payload.encode("latin-1")

        # Build PDF
        output = bytearray()
        output.extend(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")

        offsets = [0]
        for index, obj in enumerate(objects, start=1):
            offsets.append(len(output))
            output.extend(f"{index} 0 obj\n".encode("latin-1"))
            output.extend(obj)
            output.extend(b"\nendobj\n")

        xref_start = len(output)
        output.extend(f"xref\n0 {len(objects) + 1}\n".encode("latin-1"))
        output.extend(b"0000000000 65535 f \n")
        for index in range(1, len(objects) + 1):
            output.extend(f"{offsets[index]:010d} 00000 n \n".encode("latin-1"))

        output.extend(
            (
                "trailer\n"
                f"<< /Size {len(objects) + 1} /Root {catalog_id} 0 R >>\n"
                "startxref\n"
                f"{xref_start}\n"
                "%%EOF\n"
            ).encode("latin-1")
        )
        return bytes(output)


def render_markdown_to_pdf(markdown_text: str) -> bytes:
    builder = SimplePdfBuilder()

    in_code = False
    for raw_line in markdown_text.splitlines():
        line = raw_line.rstrip()

        if line.strip().startswith("```"):
            in_code = not in_code
            builder.add_spacing(4)
            continue

        if in_code:
            code_text = line if line else " "
            builder.add_wrapped(code_text, size=9.2, indent=18)
            continue

        stripped = line.strip()
        if not stripped:
            builder.add_spacing(6)
            continue

        if stripped.startswith("# "):
            builder.add_spacing(6)
            builder.add_wrapped(stripped[2:].strip(), size=18, bold=True)
            builder.add_spacing(4)
            continue

        if stripped.startswith("## "):
            builder.add_spacing(5)
            builder.add_wrapped(stripped[3:].strip(), size=14, bold=True)
            builder.add_spacing(2)
            continue

        if stripped.startswith("### "):
            builder.add_spacing(3)
            builder.add_wrapped(stripped[4:].strip(), size=12, bold=True)
            builder.add_spacing(1)
            continue

        if stripped.startswith("- "):
            builder.add_wrapped(f"- {stripped[2:].strip()}", size=10.5, indent=8)
            continue

        numeric_prefix = stripped.split(" ", 1)[0]
        if numeric_prefix.endswith(".") and numeric_prefix[:-1].isdigit():
            builder.add_spacing(2)
            builder.add_wrapped(stripped, size=10.7, bold=True)
            continue

        builder.add_wrapped(stripped, size=10.5)

    return builder.finalize()


def main() -> None:
    root = pathlib.Path(__file__).resolve().parents[1]
    md_path = root / "docs" / "ANALISIS_FRONTEND_SUGARBAY_2026-05-13.md"
    pdf_path = root / "docs" / "ANALISIS_FRONTEND_SUGARBAY_2026-05-13.pdf"

    markdown_text = md_path.read_text(encoding="utf-8")
    pdf_bytes = render_markdown_to_pdf(markdown_text)
    pdf_path.write_bytes(pdf_bytes)
    print(f"PDF generado: {pdf_path}")


if __name__ == "__main__":
    main()

