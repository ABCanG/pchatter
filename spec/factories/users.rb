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

FactoryGirl.define do
  factory :user do
    provider 'twitter'
    uid '133146202'
    name 'ABCanG(阿部)'
    screen_name'ABCanG1015'
    screen_name_low 'abcang1015'
    icon_url 'http://pbs.twimg.com/profile_images/793139343715995648/I44wX8et_normal.jpg'
    token 'xxxxx-xxxxxx'
    secret 'xxxxxx'
  end
end
