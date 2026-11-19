"""Generate the diagrams used in the Laundry Roulette final report.

Run from the repository root:  python docs/make_figures.py
Outputs PNG files into docs/figures/.
"""

import os
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.join("docs", "figures")
os.makedirs(OUT, exist_ok=True)

FONT_REG = "C:/Windows/Fonts/arial.ttf"
FONT_BOLD = "C:/Windows/Fonts/arialbd.ttf"
FONT_ITAL = "C:/Windows/Fonts/ariali.ttf"

BG = (250, 250, 248)
INK = (31, 41, 55)
NAVY = (30, 58, 138)
BLUE_LINE = (37, 99, 235)
AMBER = (180, 83, 9)
GREY_BOX = (243, 244, 246)
GREY_LINE = (156, 163, 175)


def font(size, bold=False, italic=False):
    if bold:
        return ImageFont.truetype(FONT_BOLD, size)
    if italic:
        return ImageFont.truetype(FONT_ITAL, size)
    return ImageFont.truetype(FONT_REG, size)


def wrap(draw, text, fnt, max_width):
    words, lines, current = text.split(), [], ""
    for w in words:
        trial = (current + " " + w).strip()
        if draw.textlength(trial, font=fnt) <= max_width:
            current = trial
        else:
            if current:
                lines.append(current)
            current = w
    if current:
        lines.append(current)
    return lines


def box(draw, xy, title, lines=(), fill=GREY_BOX, outline=GREY_LINE,
        title_size=26, body_size=22, title_color=INK, align="center", pad=18):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle(xy, radius=12, fill=fill, outline=outline, width=2)
    f_title = font(title_size, bold=True)
    f_body = font(body_size)
    cy = y0 + pad
    for line in wrap(draw, title, f_title, (x1 - x0) - 2 * pad):
        w = draw.textlength(line, font=f_title)
        tx = x0 + ((x1 - x0) - w) / 2 if align == "center" else x0 + pad
        draw.text((tx, cy), line, font=f_title, fill=title_color)
        cy += title_size + 6
    for raw in lines:
        for line in wrap(draw, raw, f_body, (x1 - x0) - 2 * pad):
            w = draw.textlength(line, font=f_body)
            tx = x0 + ((x1 - x0) - w) / 2 if align == "center" else x0 + pad
            draw.text((tx, cy), line, font=f_body, fill=INK)
            cy += body_size + 4


def arrow(draw, start, end, color=GREY_LINE, width=3):
    draw.line([start, end], fill=color, width=width)
    # small arrow head
    (x0, y0), (x1, y1) = start, end
    dx, dy = x1 - x0, y1 - y0
    length = max((dx * dx + dy * dy) ** 0.5, 1)
    ux, uy = dx / length, dy / length
    head = 11
    left = (x1 - ux * head - uy * head * 0.55, y1 - uy * head + ux * head * 0.55)
    right = (x1 - ux * head + uy * head * 0.55, y1 - uy * head - ux * head * 0.55)
    draw.polygon([(x1, y1), left, right], fill=color)


def title(draw, text, size=34):
    draw.text((50, 34), text, font=font(size, bold=True), fill=INK)


# ---------------------------------------------------------------- 1. stakeholders
def stakeholder_map():
    W, H = 1700, 1060
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    title(d, "Stakeholder map: who suffers, who decides, who does the work")

    hub = (620, 415, 1080, 625)
    boxes = {
        "top_left": (90, 150, 470, 320),
        "top_mid": (620, 120, 1080, 270),
        "top_right": (1230, 150, 1610, 320),
        "left": (90, 420, 500, 600),
        "right": (1200, 420, 1610, 600),
        "bottom_left": (90, 760, 500, 930),
        "bottom_mid": (620, 800, 1080, 950),
        "bottom_right": (1200, 760, 1610, 930),
    }
    content = {
        "top_left": ("Contracted laundry vendor", ["[W] washes, dries, folds"], None),
        "top_mid": ("Hostel wardens", ["[D] arbitrate disputes", "and set block rules"], None),
        "top_right": ("Hostel administration /", ["Estate office [D] approves", "any new hostel system"], None),
        "left": ("Laundry attendants", ["[W] sort, wash, fold,", "hand back the bags"], None),
        "right": ("Block WhatsApp groups", ["[W] pass on informal", "status updates"], None),
        "bottom_left": ("Parents and family", ["[S] pay for replacements,", "worry about valuables"], None),
        "bottom_mid": ("LPU IT / app team", ["[D] hosting, auth and", "integration decisions"], None),
        "bottom_right": ("Lost or damaged items", ["Cause of the harm: no", "record exists to prove", "what was in the bag"], None),
    }
    for key, xy in boxes.items():
        t, lines, _ = content[key]
        fill = (254, 243, 199) if key == "bottom_right" else GREY_BOX
        outline = (217, 119, 6) if key == "bottom_right" else GREY_LINE
        box(d, xy, t, lines, fill=fill, outline=outline, title_size=24, body_size=20)

    d.rounded_rectangle(hub, radius=14, fill=(219, 234, 254), outline=NAVY, width=3)
    box(d, hub, "PRIMARY USERS [S]", ["LPU hostellers submitting", "clothes to the block", "laundry service"],
        fill=(219, 234, 254), outline=NAVY, title_size=28, body_size=22, title_color=NAVY)

    def mid(xy):
        return ((xy[0] + xy[2]) / 2, (xy[1] + xy[3]) / 2)

    arrow(d, (300, 320), (640, 430))
    arrow(d, (850, 270), (850, 415))
    arrow(d, (1390, 320), (1060, 430))
    arrow(d, (500, 510), (620, 510))
    arrow(d, (1200, 510), (1080, 510))
    arrow(d, (300, 760), (650, 625))
    arrow(d, (850, 800), (850, 625))
    arrow(d, (1390, 760), (1050, 625))

    d.text((50, 1000), "S = suffers   D = decides   W = does the work",
           font=font(26, italic=True), fill=INK)
    img.save(os.path.join(OUT, "fig_stakeholder_map.png"))


# ---------------------------------------------------------------- 2. emotion curve
def emotion_curve():
    W, H = 1600, 800
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    title(d, "Emotion curve across the laundry journey today")

    stages = ["Set up\nschedule", "Decide to\nwash", "Drop\noff", "Wait", "Check\nstatus",
              "Ready for\npickup", "Pick\nup", "Find an\nissue", "Try to\nresolve"]
    scores = [3.0, 3.0, 2.2, 1.8, 1.4, 2.4, 3.8, 1.2, 1.0]

    left, right, top, bottom = 150, 1520, 150, 650
    d.line([(left, top), (left, bottom)], fill=INK, width=2)
    d.line([(left, bottom), (right, bottom)], fill=INK, width=2)
    for value in range(1, 6):
        y = bottom - (value - 1) / 4 * (bottom - top)
        d.line([(left - 8, y), (right, y)], fill=(229, 231, 235), width=1)
        d.text((left - 45, y - 13), str(value), font=font(22), fill=INK)
    d.text((40, top - 40), "Feeling", font=font(24, bold=True), fill=INK)

    step = (right - left - 60) / (len(stages) - 1)
    pts = []
    for i, s in enumerate(scores):
        x = left + 40 + i * step
        y = bottom - (s - 1) / 4 * (bottom - top)
        pts.append((x, y))
    d.line(pts, fill=BLUE_LINE, width=5, joint="curve")
    for (x, y), s in zip(pts, scores):
        colour = (185, 28, 28) if s <= 1.8 else BLUE_LINE
        d.ellipse([x - 9, y - 9, x + 9, y + 9], fill=colour, outline=BG, width=2)
        d.text((x - 14, y - 40), f"{s:g}", font=font(20, bold=True), fill=INK)
    for i, s in enumerate(stages):
        x = left + 40 + i * step
        cy = bottom + 20
        for line in s.split("\n"):
            w = d.textlength(line, font=font(20))
            d.text((x - w / 2, cy), line, font=font(20), fill=INK)
            cy += 24

    d.rounded_rectangle((980, 165, 1510, 250), radius=8, fill=(254, 226, 226), outline=(185, 28, 28))
    d.text((1000, 180), "Lowest points: waiting, checking,", font=font(21, bold=True), fill=(153, 27, 27))
    d.text((1000, 207), "and the dispute dead end", font=font(21), fill=(153, 27, 27))

    img.save(os.path.join(OUT, "fig_emotion_curve.png"))


# ---------------------------------------------------------------- 3. user flow
def user_flow():
    W, H = 1700, 950
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    title(d, "User flow: from opening the app to a resolved issue")

    box(d, (60, 150, 300, 260), "Landing / Login", ["email + password"], title_size=22, body_size=18)
    box(d, (380, 140, 690, 280), "Dashboard", ["stats, next drop-off,", "active batches"], title_size=22, body_size=18)
    box(d, (770, 70, 1070, 190), "Set up timings", ["block, days, windows,", "turnaround"], title_size=22, body_size=18)
    box(d, (770, 220, 1070, 340), "Submit laundry", ["size, item note,", "auto ETA"], title_size=22, body_size=18)
    box(d, (770, 370, 1070, 490), "Track status", ["7-stage tracker +", "history timeline"], title_size=22, body_size=18)
    box(d, (770, 520, 1070, 640), "Report issue", ["type, description,", "linked to batch"], title_size=22, body_size=18)

    box(d, (1170, 220, 1620, 340), "Staff console", ["one-tap stage advance,", "queue, issue inbox"], title_size=22, body_size=18)
    box(d, (1170, 400, 1620, 520), "Warden panel", ["all blocks, analytics,", "user list"], title_size=22, body_size=18)

    arrow(d, (300, 205), (380, 205), color=GREY_LINE)
    arrow(d, (690, 205), (770, 130), color=GREY_LINE)
    arrow(d, (690, 205), (770, 280), color=GREY_LINE)
    arrow(d, (690, 205), (770, 430), color=GREY_LINE)
    arrow(d, (690, 205), (770, 580), color=GREY_LINE)
    arrow(d, (1070, 430), (1170, 300), color=GREY_LINE)
    arrow(d, (1070, 280), (1170, 280), color=GREY_LINE)
    arrow(d, (1070, 600), (1170, 320), color=GREY_LINE)
    arrow(d, (1395, 340), (1395, 400), color=GREY_LINE)

    d.text((60, 730), "Seven-stage status pipeline", font=font(26, bold=True), fill=NAVY)
    stages = ["Submitted", "Received", "Washing", "Drying", "Folding", "Ready", "Picked up"]
    x = 60
    for i, s in enumerate(stages):
        fill = (219, 234, 254) if i < 6 else (220, 252, 231)
        outline = NAVY if i < 6 else (22, 101, 52)
        box(d, (x, 775, x + 205, 855), s, fill=fill, outline=outline, title_size=20)
        if i < len(stages) - 1:
            arrow(d, (x + 205, 815), (x + 232, 815), color=GREY_LINE)
        x += 232

    d.text((60, 890), "Students can only confirm the final 'Picked up' step; staff advance every earlier stage.",
           font=font(21, italic=True), fill=INK)
    img.save(os.path.join(OUT, "fig_user_flow.png"))


# ---------------------------------------------------------------- 4. architecture
def architecture():
    W, H = 1650, 1000
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    title(d, "System architecture")

    box(d, (60, 130, 1590, 290), "CLIENT  —  React 19 + Vite + Tailwind CSS",
        ["17 pages, role-based routing, AuthContext (JWT), ToastProvider,",
         "StatusTracker, NotificationsBell, DemoSimulator widget, Axios API client"],
        title_size=26, body_size=21, fill=(239, 246, 255), outline=(147, 197, 253), title_color=NAVY)

    arrow(d, (825, 290), (825, 400), color=BLUE_LINE, width=4)
    d.text((850, 325), "HTTPS  /api/*  (Vite proxy in development)", font=font(21), fill=INK)

    box(d, (60, 400, 1590, 610), "SERVER  —  Express 4 on Node 20",
        ["11 route modules: auth, timings, batches, demo, payments, reviews, services, support, notifications, users, admin",
         "JWT authentication, zod validation, helmet, rate limiting, pino request logging, health endpoint"],
        title_size=26, body_size=21, fill=(254, 249, 239), outline=(253, 230, 138), title_color=(120, 53, 15))

    arrow(d, (500, 610), (500, 700), color=BLUE_LINE, width=4)
    arrow(d, (1150, 610), (1150, 700), color=BLUE_LINE, width=4)

    box(d, (120, 700, 880, 900), "MOCK_MODE = true (demo)",
        ["in-memory collection store that mimics Mongoose,",
         "seeded users, schedules, batches, payments, reviews"],
        title_size=24, body_size=20, fill=(240, 253, 244), outline=(134, 239, 172))
    box(d, (920, 700, 1560, 900), "MOCK_MODE = false (pilot)",
        ["MongoDB via Mongoose: User, LaundryBatch, LaundryTimings,",
         "Notification, Payment, Coupon, Review, Service, SupportTicket, AuthToken"],
        title_size=24, body_size=20, fill=(240, 253, 244), outline=(134, 239, 172))
    d.text((60, 930), "The switch is an environment variable: the same routes and UI work in both modes.",
           font=font(21, italic=True), fill=INK)
    img.save(os.path.join(OUT, "fig_architecture.png"))


if __name__ == "__main__":
    stakeholder_map()
    emotion_curve()
    user_flow()
    architecture()
    print("Figures written to", OUT)
