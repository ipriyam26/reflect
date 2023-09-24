from langchain.chains import LLMChain
from langchain.memory import ConversationBufferWindowMemory
from langchain.prompts import PromptTemplate

from langchain.chat_models import ChatOpenAI
from dotenv import load_dotenv
from langchain.pydantic_v1 import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser
from const import BASE_PROMPT_TEMPLATE
from models import Response

load_dotenv()


class Data(BaseModel):
    type: str = Field(
        ...,
        description="Type of the action to be performed A: Inject after, B: Inject before, N: Replace whole body, R: Replace, D: Delete",
    )
    id: str = Field(
        ...,
        description="Id of the element to be injected after, before, replaced or deleted, Only reply with valid html id's that you know exist in the current html. Leave empty for N",
    )
    html: str = Field(
        ...,
        description="Html to be injected. Only reply with valid html, use unique id's for each element. prefix id's with gen_",
    )
    design_decision: str = Field(
        ..., description="Reason for the design you have decided upon. "
    )


class Model:
    def __init__(self) -> None:
        self.parser = PydanticOutputParser(pydantic_object=Data)

        chat = ChatOpenAI(model="gpt-4", max_tokens=2000, temperature=0.5)
        # memory = ConversationBufferWindowMemory(input_key="query", k=5)

        prompt = PromptTemplate(
            template=BASE_PROMPT_TEMPLATE,
            input_variables=["query", "history"],
            partial_variables={
                "format_instructions": self.parser.get_format_instructions()
            },
            template_format="jinja2",
        )

        self.conversation = LLMChain(
            llm=chat,
            prompt=prompt,
            verbose=True,
            # memory=memory,
        )

    def run(self, query: str, history: str) -> Response:
        response = self.conversation.run(query=query, history=history)
        history = f"{history}\nHuman:{query}\nAI:{response}\n"
        parsed = self.parser.parse(text=response)
        return Response(
            type=parsed.type, id=parsed.id, html=parsed.html, history=history
        )
