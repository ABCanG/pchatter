class ApplicationController < ActionController::Base
  class Forbidden < ActionController::ActionControllerError; end
  class IpAddressRejected < ActionController::ActionControllerError; end

  include ErrorHandlers if Rails.env.production? || Rails.env.staging?

  protect_from_forgery with: :exception
  before_action :store_current_location, unless: :skip_store_current_location?

  rescue_from ActionController::RoutingError, ActiveRecord::RecordNotFound, with: :render_404

  private

  def store_current_location
    store_location_for(:user, request.url)
  end

  def after_sign_out_path_for(_resource)
    request.referer || root_path
  end

  def skip_store_current_location?
    devise_controller? || %w(png).include?(params[:format])
  end
end
