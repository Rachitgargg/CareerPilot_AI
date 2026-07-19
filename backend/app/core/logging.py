import logging
import sys

# Configure default basic logging to output to stdout
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - [%(levelname)s] - %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Application-level logger
logger = logging.getLogger("careerpilot")
