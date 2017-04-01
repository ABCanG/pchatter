# == Schema Information
#
# Table name: paths
#
#  id         :integer          not null, primary key
#  num        :integer          not null
#  style      :json
#  data       :json
#  room_id    :integer          not null
#  user_id    :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

require 'rails_helper'

RSpec.describe Path, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
