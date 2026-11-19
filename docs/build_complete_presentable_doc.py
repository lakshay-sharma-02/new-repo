import os, sys, shutil
import docx
from docx import Document

def transform():
    # Load template
    template_path = "docs/INT_reference_template.docx"
    output_path = "docs/INT.docx"
    
    print(f"Loading {template_path}...")
    doc = Document(template_path)
    
    # Author mapping
    name_map = {
        "Aditya Singh Chauhan": "Lakshay Sharma",
        "Aditya Singh": "Lakshay Sharma",
        "Aditya": "Lakshay",
        "12509555": "12508708",
        
        "Prosad Das": "Ashutosh",
        "Prosad": "Ashutosh",
        "12530574": "12509515",
        
        "Abhijit Sharma": "Raj Patel",
        "Abhijit": "Raj",
        "12514768": "12510295",
        
        "Ayush Ranjan": "Tarun Sharma",
        "Ayush": "Tarun",
        "12527161": "12504510",
        
        "Is This Internship Real? – Discovering and Vetting Off-Campus Internships": "Laundry Roulette: Hostel Laundry Tracking & Accountability System",
        "Is This Internship Real?": "Laundry Roulette 🧺",
        "Discovering and Vetting Off-Campus Internships": "Hostel Laundry Tracking & Accountability System",
        "P24": "P21"
    }
    
    print("Executing baseline text replacements in paragraphs...")
    for p in doc.paragraphs:
        for old_txt, new_txt in name_map.items():
            if old_txt in p.text:
                for run in p.runs:
                    if old_txt in run.text:
                        run.text = run.text.replace(old_txt, new_txt)
                if old_txt in p.text:
                    p.text = p.text.replace(old_txt, new_txt)
                    
    print("Executing baseline text replacements in tables...")
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                for old_txt, new_txt in name_map.items():
                    if old_txt in cell.text:
                        for p in cell.paragraphs:
                            for run in p.runs:
                                if old_txt in run.text:
                                    run.text = run.text.replace(old_txt, new_txt)
                            if old_txt in p.text:
                                p.text = p.text.replace(old_txt, new_txt)

    # Specific Roll number fixes
    print("Updating roll numbers...")
    for table in doc.tables:
        for row in table.rows:
            for cell in row.cells:
                if "12508708" in cell.text and "42" in cell.text:
                    cell.text = cell.text.replace("42", "46")
                if "12509515" in cell.text and "54" in cell.text:
                    cell.text = cell.text.replace("54", "43")
                if "12510295" in cell.text and "10" in cell.text:
                    cell.text = cell.text.replace("10", "44")
                if "12504510" in cell.text and "24" in cell.text:
                    cell.text = cell.text.replace("24", "21")

    doc.save(output_path)
    print("Baseline pass complete and saved.")

if __name__ == "__main__":
    transform()
