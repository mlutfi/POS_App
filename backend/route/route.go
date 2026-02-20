package route

import (
	"pos_backend/app/auth"
	"pos_backend/app/category"
	"pos_backend/app/product"
	"pos_backend/app/sale"
	"pos_backend/app/user"
	"pos_backend/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/spf13/viper"
)

type RouteConfig struct {
	App             *fiber.App
	AuthMiddleware  fiber.Handler
	AuthHandler     auth.AuthHandler
	ProductHandler  product.ProductHandler
	CategoryHandler category.CategoryHandler
	SaleHandler     sale.SaleHandler
	UserHandler     user.UserHandler
	Config          *viper.Viper
}

func (c *RouteConfig) Setup() {
	// CORS middleware
	c.App.Use(func(ctx *fiber.Ctx) error {
		ctx.Set("Access-Control-Allow-Origin", "*")
		ctx.Set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
		ctx.Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
		if ctx.Method() == "OPTIONS" {
			return ctx.SendStatus(fiber.StatusNoContent)
		}
		return ctx.Next()
	})

	// Health check
	c.App.Get("/health", func(ctx *fiber.Ctx) error {
		return ctx.JSON(fiber.Map{"status": "ok"})
	})

	// API routes
	api := c.App.Group("/api")

	// Auth routes (public)
	c.AuthRoutes(api)

	// Protected routes
	protected := api.Group("/", c.AuthMiddleware)
	c.ProductRoutes(protected)
	c.CategoryRoutes(protected)
	c.SaleRoutes(protected)
	c.UserRoutes(protected)
}

func (c *RouteConfig) AuthRoutes(router fiber.Router) {
	authGroup := router.Group("/auth")
	authGroup.Post("/login", c.AuthHandler.Login)
	authGroup.Post("/logout", c.AuthHandler.Logout)
	authGroup.Get("/me", c.AuthMiddleware, c.AuthHandler.Me)
	authGroup.Post("/change-password", c.AuthMiddleware, c.AuthHandler.ChangePassword)
}

func (c *RouteConfig) ProductRoutes(router fiber.Router) {
	productGroup := router.Group("/products")
	productGroup.Get("/", c.ProductHandler.GetAll)
	productGroup.Get("/search", c.ProductHandler.Search)
	productGroup.Get("/by-category", c.ProductHandler.GetByCategory)
	productGroup.Get("/:id", c.ProductHandler.GetByID)
	productGroup.Post("/", middleware.RequireRole("OWNER", "OPS"), c.ProductHandler.Create)
	productGroup.Put("/:id", middleware.RequireRole("OWNER", "OPS"), c.ProductHandler.Update)
	productGroup.Delete("/:id", middleware.RequireRole("OWNER"), c.ProductHandler.Delete)
}

func (c *RouteConfig) CategoryRoutes(router fiber.Router) {
	categoryGroup := router.Group("/categories")
	categoryGroup.Get("/", c.CategoryHandler.GetAll)
	categoryGroup.Get("/:id", c.CategoryHandler.GetByID)
	categoryGroup.Post("/", middleware.RequireRole("OWNER", "OPS"), c.CategoryHandler.Create)
	categoryGroup.Put("/:id", middleware.RequireRole("OWNER", "OPS"), c.CategoryHandler.Update)
	categoryGroup.Delete("/:id", middleware.RequireRole("OWNER"), c.CategoryHandler.Delete)
}

func (c *RouteConfig) SaleRoutes(router fiber.Router) {
	saleGroup := router.Group("/sales")
	saleGroup.Post("/", c.SaleHandler.Create)
	saleGroup.Get("/:id", c.SaleHandler.GetByID)
	saleGroup.Post("/:id/pay-cash", c.SaleHandler.PayCash)
	saleGroup.Post("/:id/pay-qris", c.SaleHandler.PayQRIS)
	saleGroup.Get("/daily-report", c.SaleHandler.GetDailyReport)
}

func (c *RouteConfig) UserRoutes(router fiber.Router) {
	userGroup := router.Group("/users")
	userGroup.Get("/", middleware.RequireRole("OWNER", "OPS"), c.UserHandler.GetAll)
	userGroup.Get("/:id", middleware.RequireRole("OWNER", "OPS"), c.UserHandler.GetByID)
	userGroup.Post("/", middleware.RequireRole("OWNER"), c.UserHandler.Create)
	userGroup.Put("/:id", middleware.RequireRole("OWNER"), c.UserHandler.Update)
	userGroup.Delete("/:id", middleware.RequireRole("OWNER"), c.UserHandler.Delete)
}
