Rails.application.routes.draw do
  root 'home#index'
  namespace :api do 
    namespace :v1 do 
      resources :categories, only: [:index, :create, :destroy, :update] do
        post :update_properties
        get :get_filters
      end
      resources :products, only: [:index, :create, :destroy, :update] do
        collection do 
          get :filter_products
        end
      end
    end 
  end 
end
