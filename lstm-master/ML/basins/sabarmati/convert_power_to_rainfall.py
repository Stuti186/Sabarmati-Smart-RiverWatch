import sys
import re
import csv
from pathlib import Path
from datetime import datetime, timedelta

def parse_power_file(infile_path):
    infile = Path(infile_path)
    if not infile.exists():
        raise FileNotFoundError(f"{infile} not found")

    data_rows = []
    with infile.open("r", encoding="utf-8", errors="replace") as fh:
        for line in fh:
            s = line.strip()
            if not s:
                continue
            # Skip header lines
            if s.upper().startswith(("-BEGIN HEADER-","-END HEADER-","-BEGIN METADATA-","END HEADER")):
                continue
            if not re.match(r'^\d', s):
                continue
            # YEAR,MM,DD,VALUE
            m = re.match(r'^(\d{4})\s*,\s*(\d{1,2})\s*,\s*(\d{1,2})\s*,\s*([\-\d.eE]+)\s*$', s)
            if m:
                year = int(m.group(1))
                mm = int(m.group(2))
                dd = int(m.group(3))
                val = float(m.group(4))
                try:
                    date = datetime(year, mm, dd)
                except ValueError:
                    continue
                data_rows.append((date.strftime("%Y-%m-%d"), val))
                continue
            # YEAR,DOY,VALUE
            m = re.match(r'^(\d{4})\s*,\s*(\d{1,3})\s*,\s*([\-\d.eE]+)\s*$', s)
            if m:
                year = int(m.group(1))
                doy = int(m.group(2))
                val = float(m.group(3))
                date = datetime(year,1,1) + timedelta(days=doy-1)
                data_rows.append((date.strftime("%Y-%m-%d"), val))
                continue
    return data_rows

def save_as_csv(rows, out_path):
    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    rows_sorted = sorted(rows, key=lambda r: r[0])
    with out.open("w", encoding="utf-8", newline="") as fh:
        writer = csv.writer(fh)
        writer.writerow(["date","rainfall_mm"])
        for d,v in rows_sorted:
            try:
                vv = float(v)
            except:
                vv = 0.0
            writer.writerow([d, f"{vv:.3f}"])
    print(f"Wrote {len(rows_sorted)} rows to {out}")

if __name__ == "__main__":
    infile = "ML/basins/sabarmati/rainfall.csv"
    outfile = "ML/basins/sabarmati/rainfall_fixed.csv"
    rows = parse_power_file(infile)
    if not rows:
        print("No rows parsed. Verify the input file format.")
        sys.exit(2)
    save_as_csv(rows, outfile)
    print("rainfall_fixed.csv created. Replace your original rainfall.csv with this file if it looks correct.")
