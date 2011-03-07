require 'dm-core'

class Stream
  include DataMapper::Resource
  property :id, Serial
  property :title, String
  property :description, String
  property :created_at, DateTime
  property :updated_at, DateTime
end
