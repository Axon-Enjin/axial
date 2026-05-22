# Run from WSL: cd .../axial/soroban && make build
# Copy .env.example → .env and set STELLAR_SOURCE (your key name).

-include .env
export

SOURCE ?= $(STELLAR_SOURCE)
ifeq ($(SOURCE),)
  SOURCE := mainnet-wallet
endif
NETWORK ?= $(STELLAR_NETWORK)
ifeq ($(NETWORK),)
  NETWORK := testnet
endif

WASM_DIR := target/wasm32v1-none/release
CRATES := receivable_token axial_swap payroll_split settlement
DEPLOY_JSON := deployments/testnet.json

.PHONY: build test fmt clean setup check-testnet testnet-demo deploy-testnet deploy-all $(addprefix deploy-,$(CRATES))

build:
	stellar contract build
	@ls -l $(WASM_DIR)/*.wasm 2>/dev/null || true

test:
	cargo test

fmt:
	cargo fmt --all

clean:
	cargo clean

setup:
	@bash scripts/setup-dev.sh

check-testnet:
	@bash scripts/check-testnet.sh

testnet-demo:
	@bash scripts/testnet-demo-setup.sh

deploy-testnet: deploy-axial_swap

deploy-all: build
	@for c in $(CRATES); do \
		echo "=== deploy $$c (source=$(SOURCE) network=$(NETWORK)) ==="; \
		stellar contract deploy \
			--wasm $(WASM_DIR)/$$c.wasm \
			--source $(SOURCE) \
			--network $(NETWORK); \
	done
	@echo "Paste contract IDs into deployments/testnet.json and soroban/.env"

deploy-receivable_token: build
	stellar contract deploy --wasm $(WASM_DIR)/receivable_token.wasm --source $(SOURCE) --network $(NETWORK)

deploy-axial_swap: build
	stellar contract deploy --wasm $(WASM_DIR)/axial_swap.wasm --source $(SOURCE) --network $(NETWORK)

deploy-payroll_split: build
	stellar contract deploy --wasm $(WASM_DIR)/payroll_split.wasm --source $(SOURCE) --network $(NETWORK)

deploy-settlement: build
	stellar contract deploy --wasm $(WASM_DIR)/settlement.wasm --source $(SOURCE) --network $(NETWORK)
