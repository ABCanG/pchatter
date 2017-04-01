# == Schema Information
#
# Table name: users
#
#  id                  :integer          not null, primary key
#  remember_created_at :datetime
#  remember_token      :string(255)
#  sign_in_count       :integer          default(0), not null
#  current_sign_in_at  :datetime
#  last_sign_in_at     :datetime
#  current_sign_in_ip  :string(255)
#  last_sign_in_ip     :string(255)
#  provider            :string(255)      not null
#  uid                 :string(255)      not null
#  name                :string(255)      not null
#  screen_name         :string(255)      not null
#  screen_name_low     :string(255)      not null
#  icon_url            :string(255)      not null
#  token               :string(255)      not null
#  secret              :string(255)      not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#

class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :omniauthable, :trackable, :rememberable, omniauth_providers: [:twitter]

  has_many :rooms

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

  def to_param
    screen_name
  end
end
