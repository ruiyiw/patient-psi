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

# Ensure environment variables are set
data_path_env = os.getenv('DATA_PATH')
out_path_env = os.getenv('OUT_PATH')

if data_path_env is None or out_path_env is None:
    raise ValueError("Environment variables DATA_PATH and OUT_PATH must be set.")

data_path = os.path.join(os.path.dirname(
    os.path.abspath('.env')), data_path_env)
out_path = os.path.join(os.path.dirname(
    os.path.abspath('.env')), out_path_env)

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
        model=os.getenv('GENERATOR_MODEL') or "default_model",
        temperature=float(os.getenv('GENERATOR_MODEL_TEMP', 0.7)),
        max_retries=2,
    )
    attempts = 0

    while attempts < int(os.getenv('MAX_ATTEMPTS', 3)):
        _output = pydantic_parser.parse(
            str(llm.invoke(_input).content)).model_dump()
        print(_output)
        if is_json_serializable(_output):
            with open(os.path.join(out_path, out_file), 'w') as f:
                f.write(json.dumps(_output, indent=4))
            logger.info(f"Output successfully written to {out_file}")
            break
        else:
            attempts += 1
            logger.warning(
                f"Output is not JSON serializable. Attempting {attempts}/{int(os.getenv('MAX_ATTEMPTS', 3))}")
            if attempts == int(os.getenv('MAX_ATTEMPTS', 3)):
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
