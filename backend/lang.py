from pprint import pprint
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from utils import SeniorDevExampleSelector
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
        print(designer_response)
        developer_repsonse = self.senior_dev_chain.run(
            query=designer_response,
            history="",
        )
        print("developer_repsonse")
        print(developer_repsonse)
        history = f"{history}\nHuman:{query}\nAI:{developer_repsonse}\n"
        formatted_response = self.parser.parse(text=developer_repsonse)
        pprint(formatted_response.json())
        return Response(
            type=formatted_response.type,
            id=formatted_response.id,
            html=formatted_response.html,
            history=history,
        )

    def senior_dev(self, query: str, history: str) -> Response:
        response = self.senior_dev_chain.run(
            query=query,
            history=history,
        )
        self.stylePrint(
            "SENIOR DEV RESPONSE",
            "\n\n",
            "Raw:\n",
        )
        print(repr(response))
        self.stylePrint(
            "\n\n",
            "Formatted:\n",
            response,
        )
        print("\n\n")
        history = f"{history}\nHuman:{query}\nAI:{response}\n"
        parsed = self.parser.parse(text=response)
        self.stylePrint(
            "Parsed:\n",
            parsed,
            "\n\n",
        )
        return Response(
            type=parsed.type,
            id=parsed.id,
            html=parsed.html,
            history=history,
        )

    # TODO Rename this here and in `senior_dev`
    def stylePrint(self, arg0, arg1, arg2):
        print(arg0)
        # print raw response
        print(arg1)
        print(arg2)

    def junior_dev(self, query: str, history: str) -> Response:
        response = self.junior_dev_chain.run(
            query=query,
            history=history,
        )
        print("JUNIOR DEV RESPONSE")
        print(response)
        history = f"{history}\nHuman:{query}\nAI:{response}\n"
        parsed = self.parser.parse(text=response)
        return Response(
            type=parsed.type,
            id=parsed.id,
            html=parsed.html,
            history=history,
        )


if __name__ == "__main__":
    model = Model()
    res = model.senior_dev(
        """Designer Wallet Store: Luxurious Wallets for Every Style
Color Scheme:
Primary: .bg-indigo-700 for backgrounds and .text-indigo-700 for text.
Secondary: .bg-gray-100 for backgrounds and .text-gray-700 for text.
Accent: .bg-yellow-500 for backgrounds and .text-yellow-500 for text.

1. Navigation Bar:
Background: .bg-indigo-700
Logo: On the left, using .text-3xl .font-bold .text-white
Menu Items: Center-aligned, using .text-base .font-medium .text-white .hover:text-yellow-500
Search Bar: On the right, input field with .bg-gray-100 .rounded-md .pl-2, search icon image using .text-indigo-700

2. Hero Section:
Background: .bg-gray-100
Title: Centered, using .text-4xl .font-bold .text-indigo-700
Subtitle: Below the title, using .text-2xl .font-medium .text-gray-700
Image/Video: Full width below subtitle, showcasing a high-quality designer wallet.
CTA Button: Below the image, using .bg-yellow-500 .rounded-md .text-white .px-4 .py-2

3. Featured Wallets Section:
Title: .text-3xl .font-bold .text-indigo-700
Wallet Cards: Make 3-4 cards .p-2 .drop-shadow-md .rounded-md .bg-white
Image: Top of the card, full width, showcasing different designer wallets.
Title: Below the image, using .text-xl .font-bold .text-gray-700
Price: Below the title, using .text-lg .font-medium .text-gray-700
CTA Button: Below the price, using .bg-yellow-500 .rounded-md .text-white .px-4 .py-2



6. Footer:
Background: .bg-indigo-700
Logo: Centered, using .text-2xl .font-bold .text-white
Links: Below the logo, using .text-base .font-medium .text-gray-100 .hover:text-yellow-500
Social Media Icons: At the bottom, using .text-white .hover:text-yellow-500""",
        history="",
    )
    with open("resp.json", "w") as f:
        f.write(res.model_dump_json())
