from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register('categories', views.CategoryViewSet, basename='category')
router.register('brands',     views.BrandViewSet,    basename='brand')
router.register('products',   views.ProductViewSet,  basename='product')
router.register('orders',     views.OrderViewSet,    basename='order')
router.register('wishlist',   views.WishlistViewSet, basename='wishlist')

# Nested reviews under products
from rest_framework_nested import routers as nested_routers
products_router = nested_routers.NestedSimpleRouter(router, 'products', lookup='product')
products_router.register('reviews', views.ReviewViewSet, basename='product-reviews')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(products_router.urls)),
    path('banners/',            views.BannerListView.as_view(),   name='banners'),
    path('auth/register/',      views.RegisterView.as_view(),     name='register'),
    path('auth/login/',         TokenObtainPairView.as_view(),    name='login'),
    path('auth/token/refresh/', TokenRefreshView.as_view(),       name='token-refresh'),
    path('auth/logout/',        views.LogoutView.as_view(),       name='logout'),
    path('cart/',               views.CartView.as_view(),         name='cart'),
    path('profile/',            views.UserProfileView.as_view(),  name='profile'),
]

