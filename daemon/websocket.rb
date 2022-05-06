require 'digest/sha1'

# websocket.rb: Websocket wrapper for ruby TCPServer

class WebSocket
  class HandshakeError < StandardError; end
  class ParseError < StandardError; end

  attr_accessor :onmessage, :onclose

  def initialize (socket, header)
    @socket = socket
    @header = header

    handshake
    listen
  end

  def handshake
    # extract security key from header, used to generate Sec-WebSocket-Accept response header
    websocket_key = @header['Sec-WebSocket-Key']

    unless websocket_key
      @socket.write <<~EOT.encode(crlf_encoding: true) + "\r\n"
        HTTP/1.1 426 Upgrade Request
        Upgrade: websocket
        Connection: Upgrade
      EOT

      @socket.close
      raise HandshakeError, 'Rejecting non-WebSocket connection'
    end

    STDERR.puts "Websocket handshake detected with key: #{ websocket_key }"

    # "258EAFA5-E914-47DA-95CA-C5AB0DC85B11" is a magic string defined in the protocol specification,
    # see https://datatracker.ietf.org/doc/html/rfc6455#page-60
    response_key = Digest::SHA1.base64digest(websocket_key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11')
    STDERR.puts "Responding to handshake with key: #{response_key}"

    @socket.write <<~EOT.encode(crlf_encoding: true) + "\r\n"
      HTTP/1.1 101 Switching Protocols
      Upgrade: websocket
      Connection: Upgrade
      Sec-WebSocket-Accept: #{response_key}
    EOT
  end

  def listen
    Thread.new do
      begin
        until @socket.closed? do
          fin, rsv, opcode = ('%08b' % @socket.getbyte).match(/^(\d{1})(\d{3})(\d{4})$/).captures.map {|b| b.to_i(2) }

          case opcode
          when 0x1 # text
          when 0x2 # binary
          when 0x8 # close signal
            @onclose&.call
            Thread.exit
          when 0x9 # ping
          when 0xA # pong
          else
            raise ParseError, 'Invaild opcode'
          end

          # https://datatracker.ietf.org/doc/html/rfc6455#section-5.2:
          #
          # RSV1, RSV2, RSV3:  1 bit each
          #
          #   MUST be 0 unless an extension is negotiated that defines meanings
          #   for non-zero values.  If a nonzero value is received and none of
          #   the negotiated extensions defines the meaning of such a nonzero
          #   value, the receiving endpoint MUST **Fail the WebSocket Connection**.
          #
          raise ParseError, "One or more reserved bits are on: #{rsv.to_s(3).chars.map.with_index {|b, i| "reserved #{i} = #{b}" }}" unless rsv == 0

          mask, length_indicator = ('%08b' % @socket.getbyte).match(/^(\d{1})(\d{7})$/).captures.map {|b| b.to_i(2) }

          # https://datatracker.ietf.org/doc/html/rfc6455#section-5.1:
          #
          #   To avoid confusing network intermediaries (such as
          #   intercepting proxies) and for security reasons that are further
          #   discussed in Section 10.3, a client MUST mask all frames that it
          #   sends to the server (see Section 5.3 for further details).
          #
          raise ParseError, 'Frame must be masked and mask bit must be set to 1' unless mask == 1

          if length_indicator <= 125
            payload_size = length_indicator
          elsif length_indicator == 126
            payload_size = @socket.read(2).unpack('n')[0]
          else
            payload_size = @socket.read(8).unpack('Q>')[0]
          end

          masking_key = @socket.read(4).bytes
          payload_data_bytes = @socket.read(payload_size).bytes

          payload_data_bytes.map!.with_index do |byte, i|
            byte ^ masking_key[i % 4]
          end

          payload_data = payload_data_bytes.pack('C*')

          # ping-pong
          if opcode == 0x9
            send(message, opcode: 0xA)
            next
          end

          payload_data = payload_data.force_encoding('utf-8') if opcode == 1

          @onmessage&.call(payload_data)
        end
      rescue IOError => e 
        puts e.full_message unless e.message == 'stream closed in another thread'
      ensure
        @socket.close
      end
    end
  end

  def send (message, binary_mode: false, opcode: 0x1)
    opcode = 0x2 if binary_mode

    header_bytes = [ ('%<fin>b%<rsv>03b%<opcode>04b' % {
      fin: 1,
      rsv: 0,
      opcode: opcode
    }).to_i(2) ]

    message_size = message.bytesize

    if message_size <= 125
      header_bytes << ( '%<mask>b%<payload_length>07b' % { mask: 0, payload_length: message_size } ).to_i(2)
    elsif message_size < 2**16
      header_bytes << ( '%<mask>b%<payload_length>07b' % { mask: 0, payload_length: 126 } ).to_i(2)
      header_bytes += [ message_size ].pack('n').bytes # 16-bit unsigned, big-endian
    else
      header_bytes << ( '%<mask>b%<payload_length>07b' % { mask: 0, payload_length: 127 } ).to_i(2)
      header_bytes += [ message_size ].pack('Q>').bytes # 64-bit unsigned, big endian
    end

    @socket.write( header_bytes.pack('C*') ) # 8-bit unsigned (unsigned char)
    @socket.write( message )
  end
end