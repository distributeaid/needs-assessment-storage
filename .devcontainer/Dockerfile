FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu

# Install direnv
RUN export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install direnv \
    && echo 'eval "$(direnv hook bash)"' >> /home/vscode/.bashrc \
    && echo 'eval "$(direnv hook zsh)"' >> /home/vscode/.zshrc

# Install Node.js 16
RUN export DEBIAN_FRONTEND=noninteractive \
    && apt-get install -y curl \
    && curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get update \
    && apt-get install -y nodejs \
    && npm install -g npm@ \
    && node -v \
    && npm -v
