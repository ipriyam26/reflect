from pprint import pprint
from typing import List
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from utils import SeniorDevExampleSelector, parse_json_string
from langchain.chat_models import ChatOpenAI
from dotenv import load_dotenv
from langchain.pydantic_v1 import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser
from const import (
    SENIOR_DEVELOPER_DESIGN_PROMPT,
    JUNIOR_DEVELOPER_PROMPT,
    DESIGNER_PROMPT,
)
from models import Response


load_dotenv()


class Data(BaseModel):
    type: str = Field(
        ...,
        description="Type of the action to be performed A: Inject above, B: Inject below, N: Replace whole body, R: Replace element, D: Delete element",
    )
    id: str = Field(
        ...,
        description="Id of the element to be injected after, before, replaced or deleted, Only reply with valid html id's that you know exist in the current html. Leave empty for N. SHould not be empty for A, B, R, D",
    )
    html: str = Field(
        ...,
        description="Html to be injected. Only reply with valid html, use unique id's for each element.",
    )


class Model:
    def __init__(self) -> None:
        self.parser = PydanticOutputParser(pydantic_object=Data)

        chat = ChatOpenAI(model="gpt-3.5-turbo-16k", max_tokens=8000, temperature=1)
        fix = ChatOpenAI(model="gpt-3.5-turbo-16k", max_tokens=8000, temperature=0)
        # memory = ConversationBufferWindowMemory(input_key="query", k=5)
        seletor = SeniorDevExampleSelector()
        senior_developer_prompt = PromptTemplate(
            template=SENIOR_DEVELOPER_DESIGN_PROMPT,
            input_variables=["query", "history"],
            partial_variables={
                "format_instructions": self.parser.get_format_instructions(),
                "example_selector": seletor.select_examples_formatted(),
            },
            template_format="jinja2",
        )

        junior_developer_prompt = PromptTemplate(
            template=JUNIOR_DEVELOPER_PROMPT,
            input_variables=["query", "history"],
            partial_variables={
                "format_instructions": self.parser.get_format_instructions()
            },
            template_format="jinja2",
        )

        designer_prompt = PromptTemplate(
            template=DESIGNER_PROMPT,
            input_variables=["query"],
            template_format="jinja2",
        )

        self.senior_dev_chain = LLMChain(
            llm=chat,
            prompt=senior_developer_prompt,
            verbose=True,
            # memory=memory,
        )

        self.junior_dev_chain = LLMChain(
            llm=fix,
            prompt=junior_developer_prompt,
            # verbose=True,
        )

        self.designer_chain = LLMChain(
            llm=chat,
            prompt=designer_prompt,
            # verbose=True,
        )

    def design_dev(self, query: str, history: str = "") -> Response:
        designer_response = self.designer_chain.run(query=query)
        developer_repsonse = self.senior_dev_chain.run(
            query=designer_response,
            history="",
        )

        return self.add_history_format(history, query, developer_repsonse)

    def senior_dev(self, query: str, history: str) -> Response:
        response = self.senior_dev_chain.run(
            query=query,
            history=history,
        )
        return self.add_history_format(history, query, response)

    def junior_dev(self, query: str, history: str) -> Response:
        response = self.junior_dev_chain.run(
            query=query,
            history=history,
        )
        return self.add_history_format(history, query, response)

    def add_history_format(self, history: str, query: str, response: str) -> Response:
        history = f"{history}\nHuman:{query}\nAI:{response}\n"
        return parse_json_string(response, history)


if __name__ == "__main__":
    model = Model()
    print(model.parser.get_format_instructions())
