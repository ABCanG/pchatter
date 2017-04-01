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

FactoryGirl.define do
  factory :path do
    num 1
    room_id 1
    style ""
    data ""
    user_id 1
  end
end
