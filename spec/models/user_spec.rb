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

require 'rails_helper'

RSpec.describe User, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
