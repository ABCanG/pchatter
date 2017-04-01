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
