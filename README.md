<a href="https://chat.vercel.ai/">
  <img alt="Next.js 14 and App Router-ready AI chatbot." src="https://chat.vercel.ai/opengraph-image.png">
  <h1 align="center">Next.js AI Chatbot</h1>
</a>

<p align="center">
  An open-source AI chatbot app template built with Next.js, the Vercel AI SDK, OpenAI, and Vercel KV.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a> ·
  <a href="#authors"><strong>Authors</strong></a>
</p>
<br/>

## Get started on Google Colab
## Get started on local computer
### Install
We recommend starting a virtual environment with miniconda ([quick command line installation](https://docs.anaconda.com/miniconda/#quick-command-line-install)):
```bash
conda create -n patient-psi python=3.11.0
```
Then install requirements for python3 and for Next.js-based [Vercel app](https://vercel.com/). 
```bash
# Python packages
pip install -r requirements.txt

# Next.js dependencies
conda install -c conda-forge nodejs
npm install -g pnpm@8.7.4
npn install -g ts-node
npm install -g vercel
```

### Set up Vercel app
First, create a Vercel account via the [Vercel website](https://vercel.com/). 
Then, fork this repo, and create a Vercel project and a KV database linked to it. Follow the video clip for instructions.
After this, go back to the terminal. Run `vercel link` and fill in the credentials to connect to the Vercel project just created. Under your forked repo, run the following to create a `.env.local` file with automatically imported environment variables of the KV database.
```bash
vercel env pull .env.local
```
You need to add two additional environment variables to the `.env.local` file manually. We provide an example at `.env.example`. 
- `AUTH_SECRET`: use either `openssl rand -base64 32` or an [automatic generator](https://generate-secret.vercel.app/32) to generate a random secret.
- `OPENAI_API_KEY`: plug in your OpenAI API key.

Run the following commands under your forked repo to update the additional environment variables to the Vercel project settings. The Vercel app will prompt you to fill out the corresponding values and ask you to select the environments to add to. Please toggle all environments (production, development, preview).
```bash
vercel env add AUTH_SECRET
vercel env add OPENAI_API_KEY
```

To check if the above setup is successful, go to your Vercel project page, and navigate to `Settings -> Environment Variables`, and there should be at least 6 key-value pairs as shown in `.env.local`.

> Note: You should not commit your `.env` file anywhere.

## Example Patient-Ψ-Trainer server
Run the following to start the server on `localhost:8001`
```bash
pnpm install
pnpm dev --port 8001
```

## Features

- [Next.js](https://nextjs.org) App Router
- React Server Components (RSCs), Suspense, and Server Actions
- [Vercel AI SDK](https://sdk.vercel.ai/docs) for streaming chat UI
- Support for OpenAI (default), Anthropic, Cohere, Hugging Face, or custom AI chat models and/or LangChain
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - [Radix UI](https://radix-ui.com) for headless component primitives
  - Icons from [Phosphor Icons](https://phosphoricons.com)
- Chat History, rate limiting, and session storage with [Vercel KV](https://vercel.com/storage/kv)
- [NextAuth.js](https://github.com/nextauthjs/next-auth) for authentication

## Model Providers

This template ships with OpenAI `gpt-3.5-turbo` as the default. However, thanks to the [Vercel AI SDK](https://sdk.vercel.ai/docs), you can switch LLM providers to [Anthropic](https://anthropic.com), [Cohere](https://cohere.com/), [Hugging Face](https://huggingface.co), or using [LangChain](https://js.langchain.com) with just a few lines of code.

## Deploy Your Own

You can deploy your own version of the Next.js AI Chatbot to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?demo-title=Next.js+Chat&demo-description=A+full-featured%2C+hackable+Next.js+AI+chatbot+built+by+Vercel+Labs&demo-url=https%3A%2F%2Fchat.vercel.ai%2F&demo-image=%2F%2Fimages.ctfassets.net%2Fe5382hct74si%2F4aVPvWuTmBvzM5cEdRdqeW%2F4234f9baf160f68ffb385a43c3527645%2FCleanShot_2023-06-16_at_17.09.21.png&project-name=Next.js+Chat&repository-name=nextjs-chat&repository-url=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fai-chatbot&from=templates&skippable-integrations=1&env=OPENAI_API_KEY%2CAUTH_SECRET&envDescription=How+to+get+these+env+vars&envLink=https%3A%2F%2Fgithub.com%2Fvercel-labs%2Fai-chatbot%2Fblob%2Fmain%2F.env.example&teamCreateStatus=hidden&stores=[{"type":"kv"}])

## Creating a KV Database Instance

Follow the steps outlined in the [quick start guide](https://vercel.com/docs/storage/vercel-kv/quickstart#create-a-kv-database) provided by Vercel. This guide will assist you in creating and configuring your KV database instance on Vercel, enabling your application to interact with it.

Remember to update your environment variables (`KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`) in the `.env` file with the appropriate credentials provided during the KV database setup.

## Running locally

You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various OpenAI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000/).

