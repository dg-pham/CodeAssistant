import logging
import os

if os.path.exists("./backend.log"):
    os.remove("./backend.log")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("./backend.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger('L')