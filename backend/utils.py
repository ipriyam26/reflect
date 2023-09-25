import re
from langchain.prompts.example_selector.base import BaseExampleSelector
import json
from typing import Dict, List
import numpy as np

from models import Action, Response


class SeniorDevExampleSelector(BaseExampleSelector):
    def __init__(self):
        with open("example.html", "r", encoding="utf-8") as file:
            html_content = file.read()
        with open("example.txt", "r", encoding="utf-8") as file:
            text_content = file.read()

        ai = json.dumps({"type": "N", "id": "", "html": html_content})
        human = text_content
        self.examples = [{human: ai}]

    def add_example(self, example: Dict[str, str]) -> None:
        self.examples.append(example)

    def select_examples(self) -> List[dict]:
        return np.random.choice(self.examples, size=1, replace=False)

    def select_examples_formatted(self) -> str:
        key, value = list(self.select_examples()[0].items())[0]
        return f"Human: {key}\nAI: {value}"


def parse_json_string(json_string: str, history: str) -> Response:
    # Extract all valid JSON objects using regex
    json_objects_strs = re.findall(
        r'\{\s*"type"\s*:\s*"[^"]*"\s*,\s*"id"\s*:\s*"[^"]*"\s*,\s*"html"\s*:\s*"[^"]*"\s*\}',
        json_string,
    )

    # Convert extracted JSON strings to dictionaries
    json_objects = [json.loads(j_obj_str) for j_obj_str in json_objects_strs]

    return Response(
        actions=[Action(**json_object) for json_object in json_objects],
        history=history,
    )
