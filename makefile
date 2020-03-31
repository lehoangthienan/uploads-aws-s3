deploy:
	docker build -t s3-update-image .
	docker-compose up -d
