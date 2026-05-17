{/* SESSION VIEW */}
{isLoadingSession && (
  <div
    style={{
      textAlign: 'center',
      color: C.textMuted,
      padding: '30px'
    }}
  >
    Loading session...
  </div>
)}

{sessionData && sessionData.songs.length > 0 && (
  <div
    style={{
      background: C.surface,
      borderRadius: '28px',
      padding: '28px',
      border: `1px solid ${C.border}`
    }}
  >
    {/* HEADER */}
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '28px'
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: '30px',
            fontFamily: font.serif,
            color: C.text
          }}
        >
          Session {joinCode}
        </h2>

        <p
          style={{
            marginTop: '6px',
            color: C.textMuted
          }}
        >
          Song {activeSongIndex + 1} of {sessionData.songs.length}
        </p>
      </div>

      <button
        onClick={copyLink}
        style={{
          border: `1px solid ${C.border}`,
          background: C.surface,
          borderRadius: '999px',
          padding: '12px 18px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        {copied ? (
          <CheckCircle
            size={16}
            color={C.accentDark}
          />
        ) : (
          <Copy size={16} />
        )}

        {copied ? 'Copied!' : 'Share Link'}
      </button>
    </div>

    {/* CAROUSEL */}
    <div
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: '24px',
        overflow: 'hidden',
        background: '#FFFDFC'
      }}
    >
      {/* SONG HEADER */}
      <div
        style={{
          padding: '24px',
          borderBottom: `1px solid ${C.border}`,
          background: '#FDF8F2'
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '32px',
            fontFamily: font.serif,
            color: C.text
          }}
        >
          {sessionData.songs[activeSongIndex].title}
        </h3>
      </div>

      {/* LYRICS */}
      <div
        style={{
          padding: '32px',
          maxHeight: '65vh',
          overflowY: 'auto'
        }}
      >
        <div
          style={{
            whiteSpace: 'pre-wrap',
            lineHeight: 2,
            color: C.text,
            fontSize: '18px'
          }}
        >
          {sessionData.songs[activeSongIndex].lyrics
            .split('\n')
            .map((line, i) => (
              <p
                key={i}
                style={{
                  margin: '10px 0'
                }}
              >
                {line || '\u00A0'}
              </p>
            ))}
        </div>
      </div>

      {/* CONTROLS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '20px',
          borderTop: `1px solid ${C.border}`,
          background: '#FAF8F5'
        }}
      >
        <button
          disabled={activeSongIndex === 0}
          onClick={() =>
            setActiveSongIndex(prev => prev - 1)
          }
          style={{
            border: 'none',
            padding: '12px 20px',
            borderRadius: '999px',
            cursor:
              activeSongIndex === 0
                ? 'not-allowed'
                : 'pointer',
            background:
              activeSongIndex === 0
                ? C.border
                : C.accentDark,
            color: '#fff',
            fontWeight: 600
          }}
        >
          Previous
        </button>

        <button
          disabled={
            activeSongIndex ===
            sessionData.songs.length - 1
          }
          onClick={() =>
            setActiveSongIndex(prev => prev + 1)
          }
          style={{
            border: 'none',
            padding: '12px 20px',
            borderRadius: '999px',
            cursor:
              activeSongIndex ===
              sessionData.songs.length - 1
                ? 'not-allowed'
                : 'pointer',
            background:
              activeSongIndex ===
              sessionData.songs.length - 1
                ? C.border
                : C.accentDark,
            color: '#fff',
            fontWeight: 600
          }}
        >
          Next
        </button>
      </div>
    </div>

    {/* QUICK SELECTOR */}
    <div
      style={{
        display: 'flex',
        gap: '10px',
        overflowX: 'auto',
        marginTop: '20px',
        paddingBottom: '4px'
      }}
    >
      {sessionData.songs.map((song, idx) => (
        <button
          key={song.id}
          onClick={() => setActiveSongIndex(idx)}
          style={{
            border:
              idx === activeSongIndex
                ? `2px solid ${C.accentDark}`
                : `1px solid ${C.border}`,
            background:
              idx === activeSongIndex
                ? '#FDF6EE'
                : '#fff',
            padding: '10px 16px',
            borderRadius: '999px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontWeight:
              idx === activeSongIndex
                ? 700
                : 500,
            color: C.text
          }}
        >
          {song.title}
        </button>
      ))}
    </div>
  </div>
)}