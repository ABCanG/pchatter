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

require 'rails_helper'

RSpec.describe User, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
