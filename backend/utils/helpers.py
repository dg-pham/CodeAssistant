from datetime import datetime, timezone, timedelta

# Hàm trả về thời gian với múi giờ Việt Nam (UTC+7)
def vietnam_now():
    return datetime.now(timezone(timedelta(hours=7)))