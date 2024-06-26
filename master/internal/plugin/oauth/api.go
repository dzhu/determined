package oauth

import (
	"github.com/labstack/echo/v4"
)

// Root is the root of all OAuth-related routes.
const Root = "/oauth2"

// RegisterAPIHandler registers endpoints used by OAuth.
func RegisterAPIHandler(e *echo.Echo, s *Service) {
	oauth := e.Group(Root)

	// OAuth flow.
	oauth.GET("/authorize", s.authorize)
	oauth.Any("/token", s.token)

	// Client management.
	oauth.POST("/clients", s.addClient, s.users.ProcessAuthentication)
	oauth.GET("/clients", s.clients, s.users.ProcessAuthentication)
	oauth.DELETE("/clients/:id", s.deleteClient, s.users.ProcessAuthentication)
}
