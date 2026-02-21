from datetime import datetime
from typing import Literal

from pydantic import BaseModel, HttpUrl, Field

SourceName = Literal["github", "hackernews", "rss"]

class ErrorInfo(BaseModel):
    source: SourceName
    message: str
    type: Field(default="source_error", description="error category")