from langchain_core.output_parsers import PydanticOutputParser
from langchain_openai import ChatOpenAI
from generation.generation_template import GenerationModel
from dotenv import load_dotenv
import os
import json
import argparse
import logging

# Load dotenv
load_dotenv()

data_path = os.path.join(os.path.dirname(
    os.path.abspath('.env')), os.getenv('DATA_PATH'))
out_path = os.path.join(os.path.dirname(
    os.path.abspath('.env')), os.getenv('OUT_PATH'))

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def is_json_serializable(obj):
    try:
        json.dumps(obj)
        return True
    except (TypeError, OverflowError):
        return False


def generate_chain(transcript_file, out_file):
    with open(os.path.join(data_path, transcript_file), 'r') as f:
        lines = f.readlines()

    query = "Based on the therapy session transcript, summarize the patient's personal history following the below instructions. Not that `Client` means the patient in the transcript.\n\n{lines}".format(
        lines=lines)

    pydantic_parser = PydanticOutputParser(
        pydantic_object=GenerationModel.CognitiveConceptualizationDiagram)

    _input = GenerationModel.prompt_template.invoke({
        "query": query,
        "format_instructions": pydantic_parser.get_format_instructions()
    })
    llm = ChatOpenAI(
        model=os.getenv('GENERATOR_MODEL'),
        temperature=os.getenv('GENERATOR_MODEL_TEMP'),
        max_retries=2,
    )
    attempts = 0

    while attempts < int(os.getenv('MAX_ATTEMPTS')):
        _output = pydantic_parser.parse(
            llm.invoke(_input).content).model_dump()
        print(_output)
        if is_json_serializable(_output):
            with open(os.path.join(out_path, out_file), 'w') as f:
                f.write(json.dumps(_output, indent=4))
            logger.info(f"Output successfully written to {out_file}")
            break
        else:
            attempts += 1
            logger.warning(
                f"Output is not JSON serializable. Attempting {attempts}/{int(os.getenv('MAX_ATTEMPTS'))}")
            if attempts == int(os.getenv('MAX_ATTEMPTS')):
                logger.error(
                    "Max attempts reached. Could not generate a JSON serializable output.")
                raise ValueError(
                    "Could not generate a JSON serializable output after maximum attempts.")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--transcript-file', type=str,
                        default="example_transcript.txt")
    parser.add_argument('--out-file', type=str,
                        default="example_CCD_from_transcript.json")
    args = parser.parse_args()
    generate_chain(args.transcript_file, args.out_file)


if __name__ == "__main__":
    main()
