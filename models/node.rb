require 'dm-core'

class Node
  include DataMapper::Resource
  property :id, Serial
  property :ip_address, String
  property :created_at, DateTime
  property :updated_at, DateTime
end
