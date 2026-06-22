import pdfplumber

def extract_pl_cpl_table():
    with pdfplumber.open('docs/Rancangan Kurikulum SI Gasal 24-25 3.pdf') as pdf:
        # Assuming the table is on page 4, 5, or 6. We can search for "No   Kode CPL   Profil Lulusan"
        for page in pdf.pages:
            text = page.extract_text()
            if "Profil Lulusan (PL)" in text and "Kode CPL" in text:
                tables = page.extract_tables()
                for table in tables:
                    if table and len(table[0]) >= 7: # No, Kode, PL1, PL2, PL3, PL4, PL5
                        print("FOUND TABLE!")
                        for row in table:
                            print(row)
                        return

extract_pl_cpl_table()
