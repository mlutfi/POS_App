package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/spf13/viper"
)

func NewViper() *viper.Viper {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	config := viper.New()
	config.SetDefault("app.name", "POS Backend API")
	config.SetDefault("web.port", 3001)
	config.SetDefault("web.prefork", false)
	config.SetDefault("database.host", "localhost")
	config.SetDefault("database.port", 5432)
	config.SetDefault("database.name", "pos_db")
	config.SetDefault("database.username", "postgres")
	config.SetDefault("database.password", "postgres")
	config.SetDefault("database.sslmode", "disable")
	config.SetDefault("database.pool.idle", 10)
	config.SetDefault("database.pool.max", 100)
	config.SetDefault("database.pool.lifetime", 3600)
	config.SetDefault("jwt.secret", "your-secret-key-change-in-production")
	config.SetDefault("jwt.expiration", 24)

	// Bind environment variables
	config.BindEnv("web.port", "PORT")
	config.BindEnv("database.host", "DB_HOST")
	config.BindEnv("database.port", "DB_PORT")
	config.BindEnv("database.name", "DB_NAME")
	config.BindEnv("database.username", "DB_USER")
	config.BindEnv("database.password", "DB_PASSWORD")
	config.BindEnv("database.sslmode", "DB_SSLMODE")
	config.BindEnv("jwt.secret", "JWT_SECRET")
	config.BindEnv("jwt.expiration", "JWT_EXPIRATION")

	// Set from environment if available
	if port := os.Getenv("PORT"); port != "" {
		config.Set("web.port", parseInt(port))
	}
	if dbHost := os.Getenv("DB_HOST"); dbHost != "" {
		config.Set("database.host", dbHost)
	}
	if dbPort := os.Getenv("DB_PORT"); dbPort != "" {
		config.Set("database.port", parseInt(dbPort))
	}
	if dbName := os.Getenv("DB_NAME"); dbName != "" {
		config.Set("database.name", dbName)
	}
	if dbUser := os.Getenv("DB_USER"); dbUser != "" {
		config.Set("database.username", dbUser)
	}
	if dbPass := os.Getenv("DB_PASSWORD"); dbPass != "" {
		config.Set("database.password", dbPass)
	}
	if jwtSecret := os.Getenv("JWT_SECRET"); jwtSecret != "" {
		config.Set("jwt.secret", jwtSecret)
	}

	return config
}

func parseInt(s string) int {
	var result int
	for _, c := range s {
		if c >= '0' && c <= '9' {
			result = result*10 + int(c-'0')
		}
	}
	return result
}
