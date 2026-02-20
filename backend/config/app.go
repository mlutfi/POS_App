package config

import (
	"pos_backend/app/auth"
	"pos_backend/app/category"
	"pos_backend/app/product"
	"pos_backend/app/sale"
	"pos_backend/app/user"
	"pos_backend/middleware"
	"pos_backend/route"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"gorm.io/gorm"
)

type BootstrapConfig struct {
	DB       *gorm.DB
	App      *fiber.App
	Log      *logrus.Logger
	Validate *validator.Validate
	Config   *viper.Viper
}

func Bootstrap(config *BootstrapConfig) {
	// Repositories
	authRepository := auth.NewAuthRepository(config.DB)
	productRepository := product.NewProductRepository(config.DB)
	categoryRepository := category.NewCategoryRepository(config.DB)
	saleRepository := sale.NewSaleRepository(config.DB)
	userRepository := user.NewUserRepository(config.DB)

	// Use Cases
	authUseCase := auth.NewAuthUseCase(config.DB, authRepository, config.Config)
	productUseCase := product.NewProductUseCase(config.DB, productRepository)
	categoryUseCase := category.NewCategoryUseCase(config.DB, categoryRepository)
	saleUseCase := sale.NewSaleUseCase(config.DB, saleRepository)
	userUseCase := user.NewUserUseCase(config.DB, userRepository)

	// Handlers
	authHandler := auth.NewAuthHandler(authUseCase)
	productHandler := product.NewProductHandler(productUseCase)
	categoryHandler := category.NewCategoryHandler(categoryUseCase)
	saleHandler := sale.NewSaleHandler(saleUseCase)
	userHandler := user.NewUserHandler(userUseCase)

	// Middleware
	authMiddleware := middleware.AuthMiddleware(config.Config)

	// Routes
	routeConfig := route.RouteConfig{
		App:             config.App,
		AuthMiddleware:  authMiddleware,
		AuthHandler:     authHandler,
		ProductHandler:  productHandler,
		CategoryHandler: categoryHandler,
		SaleHandler:     saleHandler,
		UserHandler:     userHandler,
		Config:          config.Config,
	}

	routeConfig.Setup()
}
