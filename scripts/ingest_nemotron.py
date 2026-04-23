"""
Download the Nemotron-Personas-Singapore dataset from HuggingFace and
bulk-insert all 148k rows into the Supabase personas table.

Usage:
  pip install datasets supabase
  python scripts/ingest_nemotron.py
"""

import os
import sys
import time
from datasets import load_dataset
from supabase import create_client

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

BATCH_SIZE = 500

# Columns to pull from the dataset (country is always "Singapore" — skip it)
DATASET_COLUMNS = [
    "uuid",
    "sex",
    "age",
    "marital_status",
    "education_level",
    "occupation",
    "industry",
    "planning_area",
    "professional_persona",
    "sports_persona",
    "arts_persona",
    "travel_persona",
    "culinary_persona",
    "persona",
    "cultural_background",
    "skills_and_expertise",
    "skills_and_expertise_list",
    "hobbies_and_interests",
    "hobbies_and_interests_list",
    "career_goals_and_ambitions",
]


def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def main():
    print("Loading dataset from HuggingFace…")
    ds = load_dataset("nvidia/Nemotron-Personas-Singapore", split="train")
    print(f"  {len(ds):,} rows loaded")

    print("Connecting to Supabase…")
    client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    total = len(ds)
    inserted = 0
    errors = 0

    print(f"Inserting in batches of {BATCH_SIZE}…")
    for batch_rows in chunks(list(range(total)), BATCH_SIZE):
        batch = []
        for i in batch_rows:
            row = ds[i]
            record = {col: row.get(col) for col in DATASET_COLUMNS}
            # age comes as int64 from Arrow — cast to plain int
            if record.get("age") is not None:
                record["age"] = int(record["age"])
            batch.append(record)

        try:
            client.table("personas").insert(batch).execute()
            inserted += len(batch)
        except Exception as e:
            errors += len(batch)
            print(f"  ERROR on batch starting at {batch_rows[0]}: {e}", file=sys.stderr)
            time.sleep(2)  # back off briefly before continuing
            continue

        pct = inserted / total * 100
        print(f"  {inserted:>7,} / {total:,}  ({pct:.1f}%)", end="\r")

    print(f"\nDone. Inserted {inserted:,} rows, {errors:,} errors.")


if __name__ == "__main__":
    main()
