require 'timeout'

class DesktopEntry
  attr_accessor :parsedEntry

  def initialize (entryPath)
    if File.exist?(entryPath)
      @entryPath = entryPath
      @parsedEntry = parse
    else
      puts "File not exist!"
    end
  end

  def parse
    return File.read(@entryPath, encoding: Encoding::UTF_8) \
               .split(/^\[(.*)\]$/).reject(&:empty?).each_slice(2).to_h \
               .transform_values {|v| v.scan(/^(.+?)=(.+)$/).to_h }
  end

  def getIconPath
    iconName = @parsedEntry['Desktop Entry']['Icon']

    return Dir["#{CREW_PREFIX}/share/icons/**/#{iconName}.*"].sort_by do |f|
             f[/(\d+)x(\d+)/, 1].to_i
           end[-1]
  end

  def launch
    cmd = @parsedEntry['Desktop Entry']['Exec'].sub('/usr/bin', '/usr/local/bin')
  
    begin
      spawn cmd
    rescue => e
      puts e
    end
  end
end
        