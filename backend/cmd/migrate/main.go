package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"

	"pos_backend/entity"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	// Read DB config from environment variables
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "")
	dbname := getEnv("DB_NAME", "postgres")
	sslmode := getEnv("DB_SSLMODE", "disable")

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
		host, user, password, dbname, port, sslmode,
	)

	fmt.Printf("Connecting to database: host=%s port=%s dbname=%s user=%s sslmode=%s\n",
		host, port, dbname, user, sslmode)

	// Open GORM connection
	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true, // avoids "prepared statement already exists" errors (PgBouncer-friendly)
	}), &gorm.Config{
		Logger: gormlogger.New(
			log.New(os.Stdout, "\r\n", log.LstdFlags),
			gormlogger.Config{
				SlowThreshold:             5 * time.Second,
				LogLevel:                  gormlogger.Warn,
				IgnoreRecordNotFoundError: true,
				Colorful:                  true,
			},
		),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get underlying sql.DB: %v", err)
	}
	defer sqlDB.Close()

	fmt.Println("Database connected successfully.")
	fmt.Println("Running migrations...")

	// Run AutoMigrate for all entities in dependency order:
	//   users → categories → products → inventories
	//   → sales → sale_items → payments
	//   → stock_ins → stock_outs → stock_movements
	//   → receipt_templates
	err = db.AutoMigrate(
		&entity.User{},
		&entity.Category{},
		&entity.Product{},
		&entity.Inventory{},
		&entity.Sale{},
		&entity.SaleItem{},
		&entity.Payment{},
		&entity.StockIn{},
		&entity.StockOut{},
		&entity.StockMovement{},
		&entity.ReceiptTemplate{},
	)
	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	fmt.Println("✓ Migration completed successfully!")

	// ----------------------------------------------------------------------
	// SEED DEFAULT OWNER USER
	// ----------------------------------------------------------------------
	fmt.Println("\nChecking for default owner user...")
	var ownerCount int64
	db.Model(&entity.User{}).Where("role = ?", entity.RoleOwner).Count(&ownerCount)

	if ownerCount == 0 {
		fmt.Println("No owner user found. Seeding default owner user...")
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("Failed to hash password for seed user: %v", err)
		}

		hashedStr := string(hashedPassword)
		ownerUser := entity.User{
			Name:               "Administrator",
			Email:              "admin@admin.com",
			PasswordHash:       &hashedStr,
			Role:               entity.RoleOwner,
			MustChangePassword: true,
		}

		if err := db.Create(&ownerUser).Error; err != nil {
			log.Fatalf("Failed to seed owner user: %v", err)
		}
		fmt.Println("✓ Seeded default owner user: admin@admin.com / admin123")
	} else {
		fmt.Println("✓ Owner user already exists, skipping seed.")
	}

	fmt.Println("\nTables created/updated:")
	tables := []string{
		"  - users",
		"  - categories",
		"  - products",
		"  - inventories",
		"  - sales",
		"  - sale_items",
		"  - payments",
		"  - stock_ins",
		"  - stock_outs",
		"  - stock_movements",
		"  - receipt_templates",
	}
	for _, t := range tables {
		fmt.Println(t)
	}
}

// getEnv returns the environment variable value or a fallback default.
func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
