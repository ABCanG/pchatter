Rails.application.routes.draw do
  devise_for :users, controllers: {
    omniauth_callbacks: 'users/omniauth_callbacks'
  }
  devise_scope :user do
    get 'sign_in', to: 'devise/sessions#new', as: :new_user_session
    get 'sign_out', to: 'devise/sessions#destroy', as: :destroy_user_session
  end
  root 'home#index'

  get 'hello_world', to: 'hello_world#index'
  resources :rooms
  resources :users, param: :screen_name, only: [:show, :index]
end
