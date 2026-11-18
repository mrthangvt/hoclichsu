#!/usr/bin/env python3
"""Kiểm tra đề ôn sử lớp 10–12, không chứa dữ liệu PDF hoặc đáp án mập mờ."""
from pathlib import Path
import json, re
from html.parser import HTMLParser

BASE=Path(__file__).resolve().parents[1]/"static"
ROOT=BASE/"on-thi"
TOPICS={
    10:{"ls","role","civil","industrial","sea","vietnam","ethnic"},
    11:{"capital","socialism","sea","defense","reform","islands"},
    12:{"socialism","defense","world"},
}
PAGES={10:39,11:26,12:21}
SOURCES={10:"bdhsg-su-10.pdf",11:"he-thong-kien-thuc-lich-su-11-p1.pdf",12:"TAI-LIEU-ON-THI-LOP-12.pdf"}
counts={10:33,11:30,12:30}
ids=set()
total=0
for grade in [10,11,12]:
    path=ROOT/f"grade{grade}.js"
    text=path.read_text(encoding="utf8")
    m=re.fullmatch(r"window\\.VS_EXAM_Q"+str(grade)+r"\\s*=\\s*(\\[.*\\]);\\s*",text,re.S)
    # \\ in the regex above is escaped for JavaScript template embedding; normalise if needed
    if m is None:
        prefix=f"window.VS_EXAM_Q{grade} = "
        assert text.startswith(prefix) and text.rstrip().endswith("];"), f"Định dạng ngân hàng {grade} không đúng"
        data=json.loads(text[len(prefix):].strip()[:-1])
    else:data=json.loads(m.group(1))
    assert len(data)==counts[grade], (grade,len(data))
    for q in data:
        assert q["id"] not in ids and q["id"].startswith(str(grade)+"-"), q["id"]
        ids.add(q["id"])
        assert q["grade"]==grade and q["topic"] in TOPICS[grade], q["id"]
        assert q["source"]==SOURCES[grade] and 1<=q["page"]<=PAGES[grade],q["id"]
        assert isinstance(q["question"],str) and len(q["question"])>=18,q["id"]
        assert len(q["options"])==4 and len(set(q["options"]))==4,q["id"]
        assert all(isinstance(x,str) and len(x)>0 for x in q["options"]),q["id"]
        assert isinstance(q["answer"],int) and 0<=q["answer"]<=3,q["id"]
        assert isinstance(q["explanation"],str) and len(q["explanation"])>=30,q["id"]
    total+=len(data)
assert total==93,total
html=(ROOT/"index.html").read_text(encoding="utf8")
for file in ["app.js","style.css","grade10.js","grade11.js","grade12.js"]:
    assert (ROOT/file).is_file(),file
    assert f'"{file}"' in html,file
for required in ["gradeCards","quiz","questionPane","results","reviewList","scoreValue","timeSelect"]:
    assert f'id="{required}"' in html,required
menu=(BASE/"v411.js").read_text(encoding="utf8")
assert "Bộ đề ôn Sử" in menu and "Sách giáo khoa" in menu
assert "insertBefore(item,target)" in menu
assert "location.protocol==='file:'" in menu
assert len(ids)==93
print("PASS:",counts,", tổng",total,"câu, 4 phương án/câu, nguồn trang PDF, trang thi, menu gắn trên SGK.")
