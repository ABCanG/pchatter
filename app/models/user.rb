# == Schema Information
#
# Table name: users
#
#  id                  :integer          not null, primary key
#  remember_created_at :datetime
#  remember_token      :string
#  sign_in_count       :integer          default(0), not null
#  current_sign_in_at  :datetime
#  last_sign_in_at     :datetime
#  current_sign_in_ip  :string
#  last_sign_in_ip     :string
#  provider            :string           not null
#  uid                 :string           not null
#  name                :string           not null
#  screen_name         :string           not null
#  screen_name_low     :string           not null
#  icon_url            :string           not null
#  token               :string           not null
#  secret              :string           not null
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
