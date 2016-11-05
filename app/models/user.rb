class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :omniauthable, :trackable, :rememberable, omniauth_providers: [:twitter]

  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.name = auth.info.name
      user.screen_name = auth.info.nickname
      user.screen_name_low = auth.info.nickname.downcase
      user.icon_url = auth.info.image
      user.token = auth.credentials.token
      user.secret = auth.credentials.secret
    end
  end
end
