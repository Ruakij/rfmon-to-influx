IMAGE ?= rfmon-to-influx:dev

.PHONY: check
check:
	npm run check

.PHONY: image
image:
	docker build -t $(IMAGE) .
