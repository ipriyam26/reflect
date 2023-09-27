from functools import wraps
from pprint import pprint
import re
from langchain.prompts.example_selector.base import BaseExampleSelector
import json
from typing import Any, Dict, List
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


def extract_json_objects(s: str):
    depth = 0
    obj = ""
    for char in s:
        if char == "{":
            depth += 1
        if depth > 0:
            obj += char
        if char == "}":
            depth -= 1
            if depth == 0:
                yield obj
                obj = ""


def parse_json_string(json_string: str, history: str) -> Response:
    # Extract all valid JSON objects using regex
    valid_jsons = [
        json_str
        for json_str in extract_json_objects(json_string)
        if '"type"' in json_str and '"id"' in json_str and '"html"' in json_str
    ]
    json_objects = [json.loads(j_obj_str) for j_obj_str in valid_jsons]
    pprint(json_objects)
    return Response(
        actions=[Action(**json_object) for json_object in json_objects],
        history=history,
    )


def trim_history(func):
    @wraps(func)
    def wrapper(self, query: str, history: str, *args, **kwargs) -> Any:
        total_length = len(history)

        if total_length <= 2000:
            return func(self, query, history, *args, **kwargs)

        split_list = re.split("Human|AI", history)

        while total_length > 2000:
            removed_element = split_list.pop(0)
            total_length -= len(removed_element)

        trimmed_history = "".join(split_list)

        return func(self, query, trimmed_history, *args, **kwargs)

    return wrapper
