Rails.application.routes.draw do
  devise_for :users, controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks'
  }
  devise_scope :user do
    get 'sign_in', to: 'devise/sessions#new', as: :new_user_session
    get 'sign_out', to: 'devise/sessions#destroy', as: :destroy_user_session
  end
  root 'rooms#index'

  resources :rooms, except: [:index] do
    member do
      get 'thumbnail.png', action: :thumbnail, format: false, defaults: { format: 'png' }, as: :thumbnail
      get 'base_image.png', action: :base_image, format: false, defaults: { format: 'png' }, as: :base_image
    end
  end
  resources :users, param: :screen_name, only: [:show]
end
