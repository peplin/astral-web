require 'dm-core'

class Node
  include DataMapper::Resource
  property :uuid, String, :required => true, :unique => true, :key => true
  property :ip_address, String, :required => true
  property :port, Integer, :required => true
  property :supernode, Boolean, :default => false
  property :created_at, DateTime
  property :updated_at, DateTime
end
